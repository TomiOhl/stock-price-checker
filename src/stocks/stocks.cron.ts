import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { config } from '../config';
import { PrismaService } from '../prisma/prisma.service';
import { fetchStockQuote } from '../utils/quote.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private static readonly ONE_HOUR = 60 * 60 * 1000;

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const symbols = await this.prisma.stockPrice.findMany({
        select: { symbol: true },
        distinct: ['symbol'],
      });

      if (symbols.length === 0) {
        this.logger.log('No symbols to update');
        return;
      }

      const results = await Promise.allSettled(
        symbols.map(async ({ symbol }) => {
          const price = await fetchStockQuote(symbol, config.finnhubApiKey);
          return { symbol, price };
        }),
      );

      const data: Array<{ symbol: string; price: number }> = [];
      const invalidSymbols: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          data.push(result.value);
        } else {
          invalidSymbols.push(symbols[index].symbol);
        }
      });

      await this.prisma.stockPrice.createMany({ data });

      this.logger.log(`Updated ${data.length} stock prices`);

      if (invalidSymbols.length > 0) {
        this.logger.log(`Failed symbols: ${invalidSymbols.toString()}`);
      }

      // delete records that are older than one hour
      const cutoff = new Date(Date.now() - TasksService.ONE_HOUR);
      await this.prisma.stockPrice.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Cron job failed: ${errorMessage}`, errorStack);
    }
  }
}
