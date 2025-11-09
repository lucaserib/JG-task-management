import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateNotificationsTable1704314000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'NEW_COMMENT'],
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'taskId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'commentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_NOTIFICATIONS_READ',
        columnNames: ['read'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('notifications', 'IDX_NOTIFICATIONS_READ');
    await queryRunner.dropIndex('notifications', 'IDX_NOTIFICATIONS_USER_ID');
    await queryRunner.dropTable('notifications');
  }
}
