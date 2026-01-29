/**
 * Integration tests: real PrismaService + real DB. Only fetch (quote.util) is mocked.
 * Requires DATABASE_URL (e.g. in .env) pointing at a Postgres database.
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import * as quoteUtil from '../utils/quote.util';

jest.mock('../utils/quote.util', () => ({ fetchStockQuote: jest.fn() }));

const TEST_SYMBOLS = ['TEST1', 'TEST2', 'MISSING'];

describe('StocksController (integration)', () => {
  let controller: StocksController;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [StocksService],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<StocksController>(StocksController);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.stockPrice.deleteMany({
      where: { symbol: { in: TEST_SYMBOLS } },
    });
    jest.mocked(quoteUtil.fetchStockQuote).mockReset();
  });

  describe('getStocks', () => {
    it('returns price and moving average when stock exists', async () => {
      jest.mocked(quoteUtil.fetchStockQuote).mockResolvedValue(150);
      await controller.addCheck({ symbol: 'TEST1' });
      jest.mocked(quoteUtil.fetchStockQuote).mockResolvedValue(148);
      await controller.addCheck({ symbol: 'TEST1' });
      jest.mocked(quoteUtil.fetchStockQuote).mockResolvedValue(152);
      await controller.addCheck({ symbol: 'TEST1' });

      const result = await controller.getStocks({ symbol: 'TEST1' });

      expect([150, 148, 152]).toContain(result.price);
      expect(result.movingAverage).toBe(150); // (150 + 148 + 152) / 3
      expect(result.lastUpdated).toBeDefined();
    });

    it('throws NotFoundException when stock not added yet', async () => {
      await expect(controller.getStocks({ symbol: 'MISSING' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getStocks({ symbol: 'MISSING' })).rejects.toThrow(
        'Stock not added yet',
      );
    });
  });

  describe('addCheck', () => {
    it('fetches quote, saves to db, returns symbol and price without id', async () => {
      jest.mocked(quoteUtil.fetchStockQuote).mockResolvedValue(99.5);

      const result = await controller.addCheck({ symbol: 'TEST2' });

      expect(quoteUtil.fetchStockQuote).toHaveBeenCalledWith(
        'TEST2',
        expect.anything(),
      );
      expect(result.symbol).toBe('TEST2');
      expect(result.price).toBe(99.5);
      expect(result).not.toHaveProperty('id');
      expect(result.createdAt).toBeDefined();

      const row = await prisma.stockPrice.findFirst({
        where: { symbol: 'TEST2' },
        orderBy: { createdAt: 'desc' },
      });
      expect(row?.price).toBe(99.5);
    });
  });

  describe('deleteStock', () => {
    it('deletes all price records for symbol', async () => {
      jest.mocked(quoteUtil.fetchStockQuote).mockResolvedValue(100);
      await controller.addCheck({ symbol: 'TEST2' });
      await controller.addCheck({ symbol: 'TEST2' });

      await controller.deleteStock({ symbol: 'TEST2' });

      const count = await prisma.stockPrice.count({
        where: { symbol: 'TEST2' },
      });
      expect(count).toBe(0);
    });
  });
});
