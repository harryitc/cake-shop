/**
 * Unit Tests cho auth.service.js
 * Chương 5 - Kiểm thử phần mềm
 *
 * Hàm được kiểm thử:
 *   - login (Path Coverage - Chapter 4.1)
 *   - changePassword (Branch Coverage - Chapter 4.2)
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
jest.mock('../../utils/email.utils', () => ({
  sendResetPasswordEmail: jest.fn(),
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
      CONFLICT: 409,
    },
    ERROR_CODES: {
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      INVALID_PASSWORD: 'INVALID_PASSWORD',
      NOT_FOUND: 'NOT_FOUND',
      DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
    },
  };
});

const User = require('../../schemas/User.schema');
const { createError } = require('../../utils/response.utils');
const { login, changePassword } = require('../../services/auth.service');

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
/** Tạo object user giả */
const makeFakeUser = (overrides = {}) => ({
  _id: 'user-id-123',
  email: 'user@gmail.com',
  password_hash: '$2a$10$hashedPassword',
  role: 'user',
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ────────────────────────────────────────────────────────────────
// TEST SUITE: login
// ────────────────────────────────────────────────────────────────
describe('auth.service – login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-WL01 – Path 1: User không tồn tại
  it('TC-WL01 [Path 1]: ném lỗi UNAUTHORIZED khi email không tồn tại', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(login({ email: 'ghost@gmail.com', password: 'anypassword' }))
      .rejects
      .toMatchObject({ statusCode: 401, errorCode: 'INVALID_CREDENTIALS' });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'ghost@gmail.com' });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  // TC-WL02 – Path 2: User tồn tại nhưng sai mật khẩu
  it('TC-WL02 [Path 2]: ném lỗi UNAUTHORIZED khi sai mật khẩu', async () => {
    const fakeUser = makeFakeUser();
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login({ email: 'user@gmail.com', password: 'WrongPass!' }))
      .rejects
      .toMatchObject({ statusCode: 401, errorCode: 'INVALID_CREDENTIALS' });

    expect(bcrypt.compare).toHaveBeenCalledWith('WrongPass!', fakeUser.password_hash);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  // TC-WL03 – Path 3: Đăng nhập thành công
  it('TC-WL03 [Path 3]: trả về token và user khi email và password hợp lệ', async () => {
    const fakeUser = makeFakeUser();
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked-jwt-token');

    const result = await login({ email: 'user@gmail.com', password: 'CorrectPass123' });

    expect(result).toEqual({
      token: 'mocked-jwt-token',
      user: {
        id: fakeUser._id,
        email: fakeUser.email,
        role: fakeUser.role,
      },
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: fakeUser._id, role: fakeUser.role },
      process.env.JWT_SECRET,
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
  });

  // Kiểm tra thông điệp lỗi giống nhau (chống User Enumeration)
  it('TC-WL04 [Bảo mật]: thông báo lỗi giống nhau cho user không tồn tại và sai mật khẩu', async () => {
    const errorMessage = 'Email hoặc mật khẩu không đúng';

    // Trường hợp 1: user không tồn tại
    User.findOne.mockResolvedValue(null);
    const error1 = await login({ email: 'x@x.com', password: 'pass' }).catch((e) => e);

    // Trường hợp 2: sai mật khẩu
    User.findOne.mockResolvedValue(makeFakeUser());
    bcrypt.compare.mockResolvedValue(false);
    const error2 = await login({ email: 'user@gmail.com', password: 'wrong' }).catch((e) => e);

    expect(error1.message).toBe(errorMessage);
    expect(error2.message).toBe(errorMessage);
  });
});

// ────────────────────────────────────────────────────────────────
// TEST SUITE: changePassword
// ────────────────────────────────────────────────────────────────
describe('auth.service – changePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-WC01 – Branch B1-F: userId không tồn tại
  it('TC-WC01 [B1-F]: ném lỗi NOT_FOUND khi userId không tồn tại trong CSDL', async () => {
    User.findById.mockResolvedValue(null);

    await expect(changePassword('invalid-id', 'anypass', 'newpass123'))
      .rejects
      .toMatchObject({ statusCode: 404, errorCode: 'NOT_FOUND' });

    expect(User.findById).toHaveBeenCalledWith('invalid-id');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  // TC-WC02 – Branch B1-T, B2-F: userId hợp lệ nhưng oldPassword sai
  it('TC-WC02 [B1-T, B2-F]: ném lỗi INVALID_PASSWORD khi mật khẩu cũ không khớp', async () => {
    const fakeUser = makeFakeUser();
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(changePassword('user-id-123', 'wrongOldPass', 'newpass123'))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'INVALID_PASSWORD' });

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongOldPass', fakeUser.password_hash);
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
  });

  // TC-WC03 – Branch B1-T, B2-T: Đổi mật khẩu thành công
  it('TC-WC03 [B1-T, B2-T]: trả về true khi đổi mật khẩu thành công', async () => {
    const fakeUser = makeFakeUser();
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.genSalt.mockResolvedValue('salt-string');
    bcrypt.hash.mockResolvedValue('$2a$10$newHashedPassword');

    const result = await changePassword('user-id-123', 'CorrectOldPass', 'NewPass@789');

    expect(result).toBe(true);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass@789', 'salt-string');
    expect(fakeUser.password_hash).toBe('$2a$10$newHashedPassword');
    expect(fakeUser.save).toHaveBeenCalled();
  });

  // TC-WC04 – Kiểm tra mật khẩu mới được hash trước khi lưu
  it('TC-WC04: mật khẩu mới phải được hash (không lưu plaintext)', async () => {
    const fakeUser = makeFakeUser();
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.genSalt.mockResolvedValue('mocked-salt');
    bcrypt.hash.mockResolvedValue('$2a$10$SomeHashedValue');

    await changePassword('user-id-123', 'OldPass', 'NewPlainPass');

    // Đảm bảo giá trị lưu vào DB là hash, không phải plaintext
    expect(fakeUser.password_hash).not.toBe('NewPlainPass');
    expect(fakeUser.password_hash).toBe('$2a$10$SomeHashedValue');
  });
});
