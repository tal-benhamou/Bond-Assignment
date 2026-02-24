import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('account_transaction')
export class AccountTransaction {
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ type: 'decimal', precision: 16, scale: 2 })
  value: number;

  @CreateDateColumn({ name: 'create_date', type: 'timestamp' })
  transactionDate: Date;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
