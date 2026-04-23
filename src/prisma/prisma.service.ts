
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
      // This is the key fix — pg default is 0 (infinite wait)
      // Neon cold starts take 1-3s, so 30s gives plenty of room
    });

    // ── Handle pool-level errors gracefully ───────────────────
    // Without this, an ETIMEDOUT on an idle client crashes the process
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
        // Test the connection with a raw query before Prisma uses it
        // This wakes Neon up before the first real request hits
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


//     import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaClient } from '../generated/prisma-client/client.js';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(PrismaService.name);

//   constructor(private config: ConfigService) {
//     if (!process.env.DATABASE_URL) {
//       throw new Error('DATABASE_URL is not set in environment variables');
//     }

//     const accelerateUrl = config.get<string>('ACCELERATE_URL');
//     if (!accelerateUrl) {
//       throw new Error('ACCELERATE_URL is not set in environment variables');
//     }

//     super({
//       accelerateUrl,
//       log: ['error', 'warn'],
//     });
//   }

//   async onModuleInit() {
//     let retries = 5;
//     while (retries > 0) {
//       try {
//         await this.$connect();
//         this.logger.log('✅ Database connected successfully');
//         return;
//       } catch (error) {
//         retries--;
//         this.logger.warn(
//           `Database connection failed. Retrying... (${retries} attempts left)`
//         );
//         if (retries === 0) {
//           this.logger.error('❌ Could not connect to database after 5 attempts');
//           throw error;
//         }
//         // Wait 3 seconds before retrying — gives Neon time to wake up
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//       }
//     }
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
// }