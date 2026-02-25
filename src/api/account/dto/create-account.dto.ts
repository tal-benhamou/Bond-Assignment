import { IsInt, IsNumber, IsPositive, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../../database/enums/account-type.enum';

export class CreateAccountDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the person who owns the account',
  })
  @IsInt()
  personId: number;

  @ApiProperty({ example: 1000.0, description: 'Initial account balance' })
  @IsNumber()
  @Min(0)
  balance: number;

  @ApiProperty({
    example: 500.0,
    description: 'Maximum amount that can be withdrawn per day',
  })
  @IsNumber()
  @IsPositive()
  dailyWithdrawalLimit: number;

  @ApiProperty({
    example: 1,
    description: 'Type of account (1 = PRIVATE, 2 = BUSINESS)',
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}
