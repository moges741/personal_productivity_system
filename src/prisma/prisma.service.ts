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

//     const pool = new Pool({ connectionString });
//     const adapter = new PrismaPg(pool);

//     super({
//       adapter,
//       log: ['query', 'error', 'warn'], 
//     });

//     this.pool = pool;
//   }

//  async onModuleInit() {
//     await this.$connect().catch(err => {
//       console.error('Prisma initial connection failed:', err);
//     });
//   }

//   async onModuleDestroy() {
//     await this.$disconnect().catch(() => {});
//     await this.pool.end().catch(() => {});
//   }
// }
 
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma-client/client.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  private pool: Pool;

  constructor(private config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    // Important: Prisma Postgres requires SSL
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },   // ← This is the key fix
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect().catch(err => {
      console.error('Prisma initial connection failed:', err);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => {});
    await this.pool.end().catch(() => {});
  }
}