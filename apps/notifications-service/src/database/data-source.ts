import { DataSource, DataSourceOptions } from 'typeorm';
import { Notification } from '../entities/notification.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'challenge_db',
  entities: [Notification],
  migrations: ['dist/migrations/*.js'],
  synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in development
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
