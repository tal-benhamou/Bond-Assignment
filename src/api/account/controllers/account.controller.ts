import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { StatementQueryDto } from '../dto/statement-query.dto';
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

  @Get(':accountId/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getBalance(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<BalanceResponse> {
    return this.accountService.getBalance(accountId);
  }

  @Get(':accountId/statement')
  @ApiOperation({ summary: 'Get account statement of transactions' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Statement retrieved' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getStatement(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: StatementQueryDto,
  ): Promise<TransactionResponse[]> {
    return this.transactionService.getStatement(
      accountId,
      query.fromDate,
      query.toDate,
    );
  }

  @Post(':accountId/deposit')
  @ApiOperation({ summary: 'Deposit into an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  @ApiResponse({ status: 400, description: 'Account is inactive' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  deposit(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: DepositDto,
  ): Promise<AccountResponse> {
    return this.transactionService.deposit(accountId, dto);
  }

  @Post(':accountId/withdraw')
  @ApiOperation({ summary: 'Withdraw from an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  @ApiResponse({
    status: 400,
    description:
      'Account is inactive / Insufficient balance / Daily withdrawal limit exceeded',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  withdraw(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: WithdrawDto,
  ): Promise<AccountResponse> {
    return this.transactionService.withdraw(accountId, dto);
  }

  @Post(':accountId/block')
  @ApiOperation({ summary: 'Block an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Account blocked successfully' })
  @ApiResponse({ status: 400, description: 'Account is already blocked' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  block(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<AccountResponse> {
    return this.accountService.block(accountId);
  }
}
