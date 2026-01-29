import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  finnhubApiKey: process.env.FINNHUB_API_KEY,
  port: process.env.PORT ?? 3000,
};
