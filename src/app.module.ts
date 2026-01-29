import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), StocksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
