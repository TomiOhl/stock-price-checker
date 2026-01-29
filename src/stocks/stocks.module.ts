import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { TasksService } from './stocks.cron';

@Module({
  imports: [PrismaModule],
  controllers: [StocksController],
  providers: [StocksService, TasksService],
})
export class StocksModule {}
