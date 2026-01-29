import { PrismaService } from '../prisma/prisma.service';

/**
 * Calculates the moving average of the last 10 price records of a given stock.
 * Will calculate from less records if 10 are not available yet.
 * Caveat: keep in mind that the last 10 price records aren't necessarily
 * from the last 10 minutes.
 * @param symbol Stock symbol to calculate moving average for
 * @param prisma A Prisma instance that can be used for db queries
 * @returns Promise resolving to the average of the last 10 price records (or 0 if no records)
 */
export async function calculateMovingAverage(
  symbol: string,
  prisma: PrismaService,
): Promise<number> {
  const recentPrices = await prisma.stockPrice.findMany({
    select: { price: true },
    where: { symbol },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const count = recentPrices.length;

  if (count < 1) {
    return 0;
  }

  const sum = recentPrices.reduce((prev, curr) => prev + curr.price, 0);

  return sum / count;
}
