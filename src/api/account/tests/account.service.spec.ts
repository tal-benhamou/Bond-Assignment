import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountService } from '../services/account.service';
import { PersonService } from '../../person/services/person.service';
import { Account, Person } from '../../../database/entities';
import { AccountType } from '../../../database/enums/account-type.enum';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<Partial<Repository<Account>>>;
  let personService: jest.Mocked<Partial<PersonService>>;

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

  beforeEach(async () => {
    accountRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    personService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getRepositoryToken(Account), useValue: accountRepository },
        { provide: PersonService, useValue: personService },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = { personId: 1, balance: 1000, dailyWithdrawalLimit: 500, accountType: AccountType.PRIVATE };

    it('should create an account successfully', async () => {
      personService.findById!.mockResolvedValue(mockPerson);
      accountRepository.create!.mockReturnValue(mockAccount);
      accountRepository.save!.mockResolvedValue(mockAccount);

      const result = await service.create(dto);

      expect(personService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if person does not exist', async () => {
      personService.findById!.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return the account balance', async () => {
      accountRepository.findOneBy!.mockResolvedValue(mockAccount);

      const result = await service.getBalance(1);

      expect(result).toEqual({ accountId: 1, balance: 1000 });
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findOneBy!.mockResolvedValue(null);

      await expect(service.getBalance(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('block', () => {
    it('should block an active account', async () => {
      const account = { ...mockAccount };
      accountRepository.findOneBy!.mockResolvedValue(account);
      accountRepository.save!.mockResolvedValue({ ...account, activeFlag: false });

      const result = await service.block(1);

      expect(result.activeFlag).toBe(false);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findOneBy!.mockResolvedValue(null);

      await expect(service.block(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if account is already blocked', async () => {
      accountRepository.findOneBy!.mockResolvedValue({ ...mockAccount, activeFlag: false });

      await expect(service.block(1)).rejects.toThrow(BadRequestException);
    });
  });
});
