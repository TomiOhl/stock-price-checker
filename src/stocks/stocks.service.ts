import { Injectable, NotFoundException } from '@nestjs/common';
import type { StockPrice } from '@prisma/client';
import { calculateMovingAverage } from '../utils/avg.util';
import { config } from '../config';
import { PrismaService } from '../prisma/prisma.service';
import { fetchStockQuote } from '../utils/quote.util';
import { StocksResponse } from './stocks.types';

@Injectable()
export class StocksService {
  constructor(private prisma: PrismaService) {}

  async getStocks(symbol: string): Promise<StocksResponse> {
    const savedData = await this.prisma.stockPrice.findFirst({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
    });

    if (!savedData) {
      throw new NotFoundException('Stock not added yet');
    }

    const movingAverage = await calculateMovingAverage(symbol, this.prisma);

    return {
      price: savedData.price,
      movingAverage: movingAverage,
      lastUpdated: savedData.createdAt.toISOString(),
    };
  }

  async addCheck(symbol: string): Promise<Omit<StockPrice, 'id'>> {
    // Inserting a price record so the cron job can pick the symbol up.
    // Note: deliberately doesn't check if the symbol is already watched.
    const price = await fetchStockQuote(symbol, config.finnhubApiKey);

    const savedData = await this.prisma.stockPrice.create({
      data: {
        symbol,
        price,
      },
    });

    const { id: a, ...withoutId } = savedData;
    return withoutId;
  }

  async deleteStock(symbol: string): Promise<void> {
    const result = await this.prisma.stockPrice.deleteMany({
      where: { symbol },
    });
    if (result.count === 0) {
      throw new NotFoundException('Stock not found');
    }
  }
}
