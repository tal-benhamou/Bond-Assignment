import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, AccountTransaction } from '../../database/entities';
import { PersonModule } from '../person/person.module';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountTransaction]),
    PersonModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, TransactionService],
  exports: [AccountService, TransactionService],
})
export class AccountModule {}
