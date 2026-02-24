import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import type {
  AccountResponse,
  BalanceResponse,
  TransactionResponse,
} from '../responses/account.response';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  create(@Body() dto: CreateAccountDto): Promise<AccountResponse> {
    return this.accountService.create(dto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getBalance(@Param('id', ParseIntPipe) id: number): Promise<BalanceResponse> {
    return this.accountService.getBalance(id);
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Get account statement of transactions' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Statement retrieved' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getStatement(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<TransactionResponse[]> {
    return this.transactionService.getStatement(id, from, to);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit into an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  @ApiResponse({ status: 400, description: 'Account is inactive' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  deposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DepositDto,
  ): Promise<AccountResponse> {
    return this.transactionService.deposit(id, dto);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw from an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  @ApiResponse({ status: 400, description: 'Account is inactive / Insufficient balance / Daily withdrawal limit exceeded' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WithdrawDto,
  ): Promise<AccountResponse> {
    return this.transactionService.withdraw(id, dto);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Account blocked successfully' })
  @ApiResponse({ status: 400, description: 'Account is already blocked' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  block(@Param('id', ParseIntPipe) id: number): Promise<AccountResponse> {
    return this.accountService.block(id);
  }
}
