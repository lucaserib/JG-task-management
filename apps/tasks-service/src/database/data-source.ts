import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Comment } from '../entities/comment.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { TaskAssignee } from '../entities/task-assignee.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'challenge_db',
  entities: [Task, Comment, TaskHistory, TaskAssignee],
  migrations: ['dist/migrations/*.js'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
