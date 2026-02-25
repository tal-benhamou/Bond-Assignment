/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from '../services/transaction.service';
import { Account, Person } from '../../../database/entities';
import { AccountType } from '../../../database/enums/account-type.enum';

describe('TransactionService', () => {
  let service: TransactionService;
  let dataSource: jest.Mocked<Partial<DataSource>>;

  const mockPerson: Person = {
    personId: 1,
    name: 'John Doe',
    document: '123456789',
    birthDate: new Date('1990-05-15'),
    accounts: [],
  };

  const mockAccount: Account = {
    accountId: 1,
    personId: 1,
    balance: 1000,
    dailyWithdrawalLimit: 500,
    activeFlag: true,
    accountType: AccountType.PRIVATE,
    createDate: new Date(),
    person: mockPerson,
    transactions: [],
  };

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockAccountRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn((cb: any) => cb(mockManager)),
      getRepository: jest
        .fn()
        .mockReturnValue({ find: jest.fn(), findOneBy: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);

    jest.clearAllMocks();
    dataSource.transaction = jest.fn((cb: any) => cb(mockManager)) as any;
    dataSource.getRepository = jest.fn().mockImplementation((entity: any) => {
      if (entity === Account) return mockAccountRepo;
      return { find: jest.fn() };
    }) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    const dto = { value: 250 };

    it('should deposit successfully', async () => {
      const account = { ...mockAccount };
      mockManager.findOne.mockResolvedValue(account);
      mockManager.save.mockResolvedValue({ ...account, balance: 1250 });
      mockManager.create.mockReturnValue({ accountId: 1, value: 250 });

      const result = await service.deposit(1, dto);

      expect(result.balance).toBe(1250);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.deposit(999, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if account is inactive', async () => {
      mockManager.findOne.mockResolvedValue({
        ...mockAccount,
        activeFlag: false,
      });

      await expect(service.deposit(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('withdraw', () => {
    const dto = { value: 100 };

    it('should withdraw successfully', async () => {
      const account = { ...mockAccount };
      mockManager.findOne.mockResolvedValue(account);
      mockManager.find.mockResolvedValue([]);
      mockManager.save.mockResolvedValue({ ...account, balance: 900 });
      mockManager.create.mockReturnValue({ accountId: 1, value: -100 });

      const result = await service.withdraw(1, dto);

      expect(result.balance).toBe(900);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.withdraw(999, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if account is inactive', async () => {
      mockManager.findOne.mockResolvedValue({
        ...mockAccount,
        activeFlag: false,
      });

      await expect(service.withdraw(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      mockManager.findOne.mockResolvedValue({ ...mockAccount, balance: 50 });

      await expect(service.withdraw(1, { value: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if daily withdrawal limit exceeded', async () => {
      mockManager.findOne.mockResolvedValue({ ...mockAccount, balance: 1000 });
      mockManager.find.mockResolvedValue([
        { value: -400, transactionDate: new Date() },
      ]);

      await expect(service.withdraw(1, { value: 200 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStatement', () => {
    it('should return transactions for an account', async () => {
      const mockTransactions = [
        {
          transactionId: 1,
          accountId: 1,
          value: 250,
          transactionDate: new Date(),
        },
      ];
      mockAccountRepo.findOneBy.mockResolvedValue(mockAccount);
      const mockTxRepo = {
        find: jest.fn().mockResolvedValue(mockTransactions),
      };
      (dataSource.getRepository as jest.Mock).mockImplementation(
        (entity: any) => {
          if (entity === Account) return mockAccountRepo;
          return mockTxRepo;
        },
      );

      const result = await service.getStatement(1);

      expect(result).toEqual(mockTransactions);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      mockAccountRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getStatement(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
