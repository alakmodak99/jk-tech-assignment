import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };
  constructor() {
    try {
      this.envConfig = dotenv.parse(fs.readFileSync('.env'));
      process.env = { ...this.envConfig, ...process.env };
    } catch (err) {
      this.envConfig = process.env;
    }
  }
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.envConfig.DATABASE_HOST,
      port: parseInt(this.envConfig.DATABASE_PORT, 10),
      username: this.envConfig.DATABASE_USERNAME,
      password: this.envConfig.DATABASE_PASSWORD,
      database: this.envConfig.DATABASE_NAME,
      schema: 'public',
      synchronize: true,
      keepConnectionAlive: true,
      ssl: {
        rejectUnauthorized: false, // For development
      },
      logging: false,
      //   cache: {
      //     type: 'redis',
      //     options: {
      //       host: this.envConfig.REDIS_URL,
      //       port: parseInt(this.envConfig.REDIS_PORT, 10),
      //     },
      //   },
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
    };
  }

  public getEnvValue(key: string): string {
    return this.envConfig[key] ? this.envConfig[key] : null;
  }
}
