import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 1, description: 'ID of the person who owns the account' })
  @IsInt()
  personId: number;

  @ApiProperty({ example: 1000.0, description: 'Initial account balance' })
  @IsNumber()
  @Min(0)
  balance: number;

  @ApiProperty({ example: 500.0, description: 'Maximum amount that can be withdrawn per day' })
  @IsNumber()
  @IsPositive()
  dailyWithdrawalLimit: number;

  @ApiProperty({ example: 1, description: 'Type of account' })
  @IsInt()
  accountType: number;
}
