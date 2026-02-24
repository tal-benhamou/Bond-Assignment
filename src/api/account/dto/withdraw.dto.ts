import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ example: 100.0, description: 'Amount to withdraw' })
  @IsNumber()
  @IsPositive()
  value: number;
}
