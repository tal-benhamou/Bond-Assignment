import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './api/health/health.module';
import { PersonModule } from './api/person/person.module';
import { AccountModule } from './api/account/account.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    PersonModule,
    AccountModule,
  ],
})
export class AppModule {}
