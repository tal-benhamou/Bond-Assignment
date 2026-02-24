import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PersonService } from '../services/person.service';
import { Person } from '../../../database/entities';
import { CreatePersonDto } from '../dto/create-person.dto';

describe('PersonService', () => {
  let service: PersonService;
  let repository: jest.Mocked<Partial<Repository<Person>>>;

  const mockPerson: Person = {
    personId: 1,
    name: 'John Doe',
    document: '123456789',
    birthDate: new Date('1990-05-15'),
    accounts: [],
  };

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: getRepositoryToken(Person), useValue: repository },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreatePersonDto = {
      name: 'John Doe',
      document: '123456789',
      birthDate: '1990-05-15',
    };

    it('should create a person successfully', async () => {
      repository.findOneBy!.mockResolvedValue(null);
      repository.create!.mockReturnValue(mockPerson);
      repository.save!.mockResolvedValue(mockPerson);

      const result = await service.create(dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ document: dto.document });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockPerson);
      expect(result).toEqual(mockPerson);
    });

    it('should throw ConflictException if document already exists', async () => {
      repository.findOneBy!.mockResolvedValue(mockPerson);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
