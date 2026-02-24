import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 250.0, description: 'Amount to deposit' })
  @IsNumber()
  @IsPositive()
  value: number;
}
