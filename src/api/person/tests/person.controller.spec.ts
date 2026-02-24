import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from '../controllers/person.controller';
import { PersonService } from '../services/person.service';
import { Person } from '../../../database/entities';
import { CreatePersonDto } from '../dto/create-person.dto';
import { PersonResponse } from '../responses/person.response';

describe('PersonController', () => {
  let controller: PersonController;
  let service: jest.Mocked<Partial<PersonService>>;

  const mockPerson: Person = {
    personId: 1,
    name: 'John Doe',
    document: '123456789',
    birthDate: new Date('1990-05-15'),
    accounts: [],
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: service }],
    }).compile();

    controller = module.get<PersonController>(PersonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call personService.create and return the result', async () => {
      const dto: CreatePersonDto = {
        name: 'John Doe',
        document: '123456789',
        birthDate: '1990-05-15',
      };

      (service.create as jest.Mock<Promise<PersonResponse>>).mockResolvedValue(
        mockPerson as PersonResponse,
      );

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPerson);
    });
  });
});
