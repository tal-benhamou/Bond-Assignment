import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { AccountTransaction } from './account-transaction.entity';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'person_id' })
  personId: number;

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0 })
  balance: number;

  @Column({
    name: 'daily_withdrawal_limit',
    type: 'decimal',
    precision: 16,
    scale: 2,
  })
  dailyWithdrawalLimit: number;

  @Column({ name: 'active_flag', type: 'boolean', default: true })
  activeFlag: boolean;

  @Column({ name: 'account_type', type: 'smallint' })
  accountType: number;

  @CreateDateColumn({ name: 'create_date', type: 'timestamp' })
  createDate: Date;

  @ManyToOne(() => Person, (person) => person.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @OneToMany(() => AccountTransaction, (tx) => tx.account)
  transactions: AccountTransaction[];
}
