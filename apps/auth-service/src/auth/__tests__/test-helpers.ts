export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedPassword123',
  refreshToken: undefined,
  resetPasswordToken: undefined,
  resetPasswordExpires: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createMockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

export const createMockJwtService = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});
