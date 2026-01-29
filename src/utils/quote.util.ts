import { HttpException, HttpStatus } from '@nestjs/common';

export type FinnhubQuoteResponse = {
  c: number; // current price
};

/**
 * Fetches stock quote data from Finnhub API
 * @param symbol Stock symbol to fetch
 * @param apiKey Finnhub API key
 * @returns Promise resolving to current price
 * @throws HttpException if the API request fails or API key is missing
 */
export async function fetchStockQuote(
  symbol: string,
  apiKey?: string,
): Promise<number> {
  if (!apiKey) {
    throw new HttpException(
      'Finnhub API key is not configured',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (response.status === 404) {
      throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
    }
    throw new HttpException(
      'Failed to fetch stock data',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const data = (await response.json()) as FinnhubQuoteResponse;

  if (!('c' in data) || typeof data.c !== 'number') {
    throw new HttpException(
      'Price missing from Finnhub response',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (data.c === 0) {
    throw new HttpException('Stock price not found', HttpStatus.NOT_FOUND);
  }

  return data.c;
}
