import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../../database/entities';
import { CreatePersonDto } from '../dto/create-person.dto';
import type { PersonResponse } from '../responses/person.response';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async findById(personId: number): Promise<Person | null> {
    return this.personRepository.findOneBy({ personId });
  }

  async create(dto: CreatePersonDto): Promise<PersonResponse> {
    const existing = await this.personRepository.findOneBy({
      document: dto.document,
    });

    if (existing) {
      throw new ConflictException(
        `Person with document "${dto.document}" already exists`,
      );
    }

    const person = this.personRepository.create(dto);
    return this.personRepository.save(person);
  }
}
