import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // carga el .env manualmente, porque este archivo corre fuera de NestJS

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false,
  },
});
