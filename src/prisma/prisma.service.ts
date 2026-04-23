
// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaClient } from '../generated/prisma-client/client.js';
// import { Pool } from 'pg';
// import { PrismaPg } from '@prisma/adapter-pg';

// @Injectable()
// export class PrismaService
//   extends PrismaClient
//   implements OnModuleInit, OnModuleDestroy {

//   private pool: Pool;

//   constructor(private config: ConfigService) {
//     const connectionString = config.get<string>('DATABASE_URL');

//     if (!connectionString) {
//       throw new Error('DATABASE_URL is not set in environment variables');
//     }

//     const pool = new Pool({
//       connectionString,
//       ssl: { rejectUnauthorized: false },   
//     });

//     const adapter = new PrismaPg(pool);

//     super({
//       adapter,
//       log: ['error', 'warn'],
//     });

//     this.pool = pool;
//   }

//   async onModuleInit() {
//     await this.$connect().catch(err => {
//       console.error('Prisma initial connection failed:', err);
//     });
//   }

//   async onModuleDestroy() {
//     await this.$disconnect().catch(() => {});
//     await this.pool.end().catch(() => {});
//   }
// }


import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma-client/client.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor(private config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },

      // ── Neon-specific pool settings ──────────────────────────
      max: 5,                  // Neon free tier max is 10 — stay well under
      min: 0,                  // don't hold idle connections open
      idleTimeoutMillis: 10000,       // release idle connections after 10s
      connectionTimeoutMillis: 30000, // wait up to 30s for a connection
         });

        pool.on('error', (err) => {
      console.error('pg pool error (Neon cold start?):', err.message);
      // Don't throw — the pool will create a new connection on next query
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['error', 'warn'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    let retries = 5;

    while (retries > 0) {
      try {
        
        await this.pool.query('SELECT 1');
        await this.$connect();
        this.logger.log('✅ Database connected (Neon)');
        return;
      } catch (err: any) {
        retries--;
        this.logger.warn(
          `Connection attempt failed (${err.message}). ` +
          `Retrying in 3s... (${retries} left)`
        );
        if (retries === 0) {
          this.logger.error('❌ Could not connect after 5 attempts');
          throw err;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => {});
    await this.pool.end().catch(() => {});
  }
}
