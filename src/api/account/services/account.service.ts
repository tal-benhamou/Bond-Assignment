import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../database/entities';
import { PersonService } from '../../person/services/person.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import type {
  AccountResponse,
  BalanceResponse,
} from '../responses/account.response';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly personService: PersonService,
  ) {}

  async create(dto: CreateAccountDto): Promise<AccountResponse> {
    const person = await this.personService.findById(dto.personId);

    if (!person) {
      throw new NotFoundException(`Person with id ${dto.personId} not found`);
    }

    const account = this.accountRepository.create(dto);
    return this.accountRepository.save(account);
  }

  async getBalance(accountId: number): Promise<BalanceResponse> {
    const account = await this.accountRepository.findOneBy({ accountId });

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    return { accountId: account.accountId, balance: Number(account.balance) };
  }

  async block(accountId: number): Promise<AccountResponse> {
    const account = await this.accountRepository.findOneBy({ accountId });

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    if (!account.activeFlag) {
      throw new BadRequestException('Account is already blocked');
    }

    account.activeFlag = false;
    return this.accountRepository.save(account);
  }
}
