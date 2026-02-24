import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../controllers/account.controller';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { Account, Person } from '../../../database/entities';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: jest.Mocked<Partial<AccountService>>;
  let transactionService: jest.Mocked<Partial<TransactionService>>;

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
    accountType: 1,
    createDate: new Date(),
    person: mockPerson,
    transactions: [],
  };

  beforeEach(async () => {
    accountService = {
      create: jest.fn(),
      getBalance: jest.fn(),
      block: jest.fn(),
    };

    transactionService = {
      deposit: jest.fn(),
      withdraw: jest.fn(),
      getStatement: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: accountService },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call accountService.create and return the result', async () => {
      const dto = { personId: 1, balance: 1000, dailyWithdrawalLimit: 500, accountType: 1 };
      accountService.create!.mockResolvedValue(mockAccount);

      const result = await controller.create(dto);

      expect(accountService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('getBalance', () => {
    it('should call accountService.getBalance and return the result', async () => {
      const expected = { accountId: 1, balance: 1000 };
      accountService.getBalance!.mockResolvedValue(expected);

      const result = await controller.getBalance(1);

      expect(accountService.getBalance).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  describe('getStatement', () => {
    it('should call transactionService.getStatement with date params', async () => {
      transactionService.getStatement!.mockResolvedValue([]);

      const result = await controller.getStatement(1, { fromDate: '2026-01-01', toDate: '2026-01-31' });

      expect(transactionService.getStatement).toHaveBeenCalledWith(1, '2026-01-01', '2026-01-31');
      expect(result).toEqual([]);
    });
  });

  describe('deposit', () => {
    it('should call transactionService.deposit and return the result', async () => {
      const updated = { ...mockAccount, balance: 1250 };
      transactionService.deposit!.mockResolvedValue(updated);

      const result = await controller.deposit(1, { value: 250 });

      expect(transactionService.deposit).toHaveBeenCalledWith(1, { value: 250 });
      expect(result.balance).toBe(1250);
    });
  });

  describe('withdraw', () => {
    it('should call transactionService.withdraw and return the result', async () => {
      const updated = { ...mockAccount, balance: 900 };
      transactionService.withdraw!.mockResolvedValue(updated);

      const result = await controller.withdraw(1, { value: 100 });

      expect(transactionService.withdraw).toHaveBeenCalledWith(1, { value: 100 });
      expect(result.balance).toBe(900);
    });
  });

  describe('block', () => {
    it('should call accountService.block and return the result', async () => {
      const blocked = { ...mockAccount, activeFlag: false };
      accountService.block!.mockResolvedValue(blocked);

      const result = await controller.block(1);

      expect(accountService.block).toHaveBeenCalledWith(1);
      expect(result.activeFlag).toBe(false);
    });
  });
});
