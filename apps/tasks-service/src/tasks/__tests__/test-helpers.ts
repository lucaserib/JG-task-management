import { TaskStatus, TaskPriority } from '@repo/types';

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
};

export const mockTask = {
  id: 'task-123',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: new Date('2024-12-31'),
  creatorId: 'user-123',
  assignees: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createMockRepositories = () => ({
  task: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  },
  comment: {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  history: {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  assignee: {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
});

export const createMockAuthService = () => ({
  send: jest.fn(),
});

export const createMockEventsService = () => ({
  publishTaskCreated: jest.fn(),
  publishTaskUpdated: jest.fn(),
  publishCommentCreated: jest.fn(),
});
