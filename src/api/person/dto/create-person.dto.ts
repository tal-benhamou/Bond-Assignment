import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789', description: 'Unique identification document number' })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({ example: '1990-05-15', description: 'ISO 8601 date string' })
  @IsDateString()
  birthDate: string;
}
