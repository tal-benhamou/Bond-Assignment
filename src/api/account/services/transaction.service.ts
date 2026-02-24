import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Account, AccountTransaction } from '../../../database/entities';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import type {
  AccountResponse,
  TransactionResponse,
} from '../responses/account.response';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  async deposit(accountId: number, dto: DepositDto): Promise<AccountResponse> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOneBy(Account, { accountId });

      if (!account) {
        throw new NotFoundException(`Account with id ${accountId} not found`);
      }

      if (!account.activeFlag) {
        throw new BadRequestException('Account is inactive');
      }

      account.balance = Number(account.balance) + dto.value;
      await manager.save(Account, account);

      const transaction = manager.create(AccountTransaction, {
        accountId,
        value: dto.value,
      });
      await manager.save(AccountTransaction, transaction);

      return account;
    });
  }

  async withdraw(
    accountId: number,
    dto: WithdrawDto,
  ): Promise<AccountResponse> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOneBy(Account, { accountId });

      if (!account) {
        throw new NotFoundException(`Account with id ${accountId} not found`);
      }

      if (!account.activeFlag) {
        throw new BadRequestException('Account is inactive');
      }

      if (Number(account.balance) < dto.value) {
        throw new BadRequestException('Insufficient balance');
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todaysWithdrawals = await manager.find(AccountTransaction, {
        where: {
          accountId,
          value: Between(-Infinity, -0.01),
          transactionDate: Between(todayStart, todayEnd),
        },
      });

      const totalWithdrawnToday = todaysWithdrawals.reduce(
        (sum, tx) => sum + Math.abs(Number(tx.value)),
        0,
      );

      if (
        totalWithdrawnToday + dto.value >
        Number(account.dailyWithdrawalLimit)
      ) {
        throw new BadRequestException(
          `Daily withdrawal limit exceeded. Limit: ${account.dailyWithdrawalLimit}, already withdrawn today: ${totalWithdrawnToday}`,
        );
      }

      account.balance = Number(account.balance) - dto.value;
      await manager.save(Account, account);

      const transaction = manager.create(AccountTransaction, {
        accountId,
        value: -dto.value,
      });
      await manager.save(AccountTransaction, transaction);

      return account;
    });
  }

  async getStatement(
    accountId: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<TransactionResponse[]> {
    const account = await this.accountRepository.findOneBy({ accountId });

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    const where: FindOptionsWhere<AccountTransaction> = { accountId };

    if (fromDate && toDate) {
      where.transactionDate = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      where.transactionDate = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      where.transactionDate = LessThanOrEqual(new Date(toDate));
    }

    return this.dataSource.getRepository(AccountTransaction).find({
      where,
      order: { transactionDate: 'DESC' },
    });
  }
}
