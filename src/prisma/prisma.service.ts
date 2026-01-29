import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: config.databaseUrl });
    super({ adapter });
  }
}
