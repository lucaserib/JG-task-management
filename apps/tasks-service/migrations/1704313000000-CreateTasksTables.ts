import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTasksTables1704313000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: "'MEDIUM'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
            default: "'TODO'",
          },
          {
            name: 'creatorId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASKS_TITLE',
        columnNames: ['title'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASKS_PRIORITY',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASKS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_TASKS_CREATOR_ID',
        columnNames: ['creatorId'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_assignees',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'taskId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'assignedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'task_assignees',
      new TableIndex({
        name: 'IDX_TASK_ASSIGNEES_TASK_ID',
        columnNames: ['taskId'],
      }),
    );

    await queryRunner.createIndex(
      'task_assignees',
      new TableIndex({
        name: 'IDX_TASK_ASSIGNEES_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'task_assignees',
      new TableIndex({
        name: 'IDX_TASK_ASSIGNEES_UNIQUE',
        columnNames: ['taskId', 'userId'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'task_assignees',
      new TableForeignKey({
        columnNames: ['taskId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'taskId',
            type: 'uuid',
          },
          {
            name: 'authorId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'comments',
      new TableIndex({
        name: 'IDX_COMMENTS_TASK_ID',
        columnNames: ['taskId'],
      }),
    );

    await queryRunner.createIndex(
      'comments',
      new TableIndex({
        name: 'IDX_COMMENTS_AUTHOR_ID',
        columnNames: ['authorId'],
      }),
    );

    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['taskId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'taskId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'changes',
            type: 'jsonb',
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
      'task_history',
      new TableIndex({
        name: 'IDX_TASK_HISTORY_TASK_ID',
        columnNames: ['taskId'],
      }),
    );

    await queryRunner.createIndex(
      'task_history',
      new TableIndex({
        name: 'IDX_TASK_HISTORY_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createForeignKey(
      'task_history',
      new TableForeignKey({
        columnNames: ['taskId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_history');
    await queryRunner.dropTable('comments');
    await queryRunner.dropTable('task_assignees');
    await queryRunner.dropTable('tasks');
  }
}
