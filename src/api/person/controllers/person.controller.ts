import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PersonService } from '../services/person.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import type { PersonResponse } from '../responses/person.response';

@ApiTags('Persons')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created successfully' })
  @ApiResponse({ status: 409, description: 'Person with this document already exists' })
  create(@Body() dto: CreatePersonDto): Promise<PersonResponse> {
    return this.personService.create(dto);
  }
}
