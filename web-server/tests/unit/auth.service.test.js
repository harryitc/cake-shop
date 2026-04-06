/**
 * Unit Tests cho auth.service.js
 * Chương 5 - Kiểm thử phần mềm
 *
 * Kỹ thuật áp dụng:
 *   - login: Path Coverage (Chapter 4.1)
 *   - changePassword: Branch Coverage (Chapter 4.2)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ────────────────────────────────────────────────────────────────
// Mock các module phụ thuộc
// ────────────────────────────────────────────────────────────────
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../schemas/User.schema');
jest.mock('../../utils/response.utils', () => ({
  createError: jest.fn((message, status, code) => {
    const err = new Error(message);
    err.statusCode = status;
    err.errorCode = code;
    return err;
  }),
}));
jest.mock('../../config/constants', () => {
  const actual = jest.requireActual('../../config/constants');
  return {
    ...actual,
    HTTP_STATUS: {
      OK: 200,
      UNAUTHORIZED: 401,
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
    },
    ERROR_CODES: {
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      INVALID_PASSWORD: 'INVALID_PASSWORD',
      NOT_FOUND: 'NOT_FOUND',
    },
  };
});

const User = require('../../schemas/User.schema');
const { register, login, getProfile, updateProfile, changePassword } = require('../../services/auth.service');

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
const makeFakeUser = (overrides = {}) => ({
  _id: 'user-123',
  email: 'u@g.com',
  password_hash: 'hashed',
  role: 'user',
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ────────────────────────────────────────────────────────────────
// TEST SUITE: login (Kỹ thuật: Path Coverage)
// ────────────────────────────────────────────────────────────────
describe('auth.service – login (Path Coverage)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('TC-WL01 [Path 1]: User không tồn tại (findOne returns null)', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(login({ email: 'ghost@g.com', password: 'any' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('TC-WL02 [Path 2]: User tồn tại nhưng sai mật khẩu', async () => {
    User.findOne.mockResolvedValue(makeFakeUser());
    bcrypt.compare.mockResolvedValue(false);
    await expect(login({ email: 'u@g.com', password: 'wrong' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('TC-WL03 [Path 3]: Đăng nhập thành công (Toàn bộ điều kiện thỏa mãn)', async () => {
    const fakeUser = makeFakeUser();
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');

    const res = await login({ email: 'u@g.com', password: 'correct' });
    expect(res.token).toBe('token');
  });
});

// ────────────────────────────────────────────────────────────────
// TEST SUITE: changePassword (Kỹ thuật: Branch Coverage)
// ────────────────────────────────────────────────────────────────
describe('auth.service – changePassword (Branch Coverage)', () => {
  beforeEach(() => jest.clearAllMocks());

  // B1-T: if (!user) is True
  it('TC-WC01 [Branch B1-T]: ném lỗi khi không tìm thấy User (userId sai)', async () => {
    User.findById.mockResolvedValue(null);
    await expect(changePassword('ghost', 'old', 'new'))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  // B1-F, B2-T: user tồn tại (B1-F) nhưng mật khẩu không khớp (B2-T)
  it('TC-WC02 [Branch B1-F, B2-T]: ném lỗi khi mật khẩu cũ không khớp', async () => {
    User.findById.mockResolvedValue(makeFakeUser());
    bcrypt.compare.mockResolvedValue(false);
    await expect(changePassword('id', 'wrong', 'new'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  // B1-F, B2-F: Toàn bộ các nhánh False (vượt qua các câu lệnh IF)
  it('TC-WC03 [Branch B1-F, B2-F]: đổi mật khẩu thành công (Mọi điều kiện False)', async () => {
    const fakeUser = makeFakeUser();
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.genSalt.mockResolvedValue('s');
    bcrypt.hash.mockResolvedValue('h');

    const res = await changePassword('id', 'correct', 'new');
    expect(res).toBe(true);
    expect(fakeUser.save).toHaveBeenCalled();
  });
});
