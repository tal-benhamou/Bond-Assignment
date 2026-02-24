import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Account } from './account.entity';

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn({ name: 'person_id' })
  personId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, unique: true })
  document: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @OneToMany(() => Account, (account) => account.person)
  accounts: Account[];
}
