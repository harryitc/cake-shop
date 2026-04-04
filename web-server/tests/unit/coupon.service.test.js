/**
 * Unit Tests cho coupon.service.js – phần tính toán discount
 * Chương 5 - Kiểm thử phần mềm
 *
 * Kỹ thuật áp dụng: Branch + Condition Coverage (Chapter 4.4)
 */

// ────────────────────────────────────────────────────────────────
// Mock các module phụ thuộc
// ────────────────────────────────────────────────────────────────
jest.mock('../../schemas/Coupon.schema');
jest.mock('../../schemas/Order.schema');
jest.mock('../../schemas/Cake.schema');
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
      NOT_FOUND: 404,
      BAD_REQUEST: 400,
    },
    ERROR_CODES: {
      COUPON_INVALID: 'COUPON_INVALID',
      COUPON_NOT_STARTED: 'COUPON_NOT_STARTED',
      COUPON_EXPIRED: 'COUPON_EXPIRED',
      COUPON_LIMIT_REACHED: 'COUPON_LIMIT_REACHED',
      COUPON_MIN_VALUE_NOT_MET: 'COUPON_MIN_VALUE_NOT_MET',
    },
    ORDER_STATUS: { REJECTED: 'REJECTED' },
  };
});

const Coupon = require('../../schemas/Coupon.schema');
const CouponService = require('../../services/coupon.service');

// ────────────────────────────────────────────────────────────────
// Helper: Tạo coupon giả
// ────────────────────────────────────────────────────────────────
const makeFakeCoupon = (overrides = {}) => ({
  code: 'TESTCODE',
  is_active: true,
  start_date: new Date('2020-01-01'),
  end_date: new Date('2099-12-31'),
  usage_limit: null,
  used_count: 0,
  usage_limit_per_user: null,
  min_order_value: 0,
  applicable_categories: [],
  type: 'FIXED',
  value: 50_000,
  max_discount_value: null,
  ...overrides,
});

// ────────────────────────────────────────────────────────────────
// TEST SUITE: validateCoupon – logic tính discount
// ────────────────────────────────────────────────────────────────
describe('coupon.service – validateCoupon (discount calculation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────
  // NHÓM 1: Kiểm tra điều kiện hợp lệ của coupon
  // ──────────────────────────────────────────────────────────────

  // TC-WV-E01: Coupon không tồn tại
  it('TC-WV-E01: ném lỗi NOT_FOUND khi coupon không tồn tại', async () => {
    Coupon.findOne.mockResolvedValue(null);

    await expect(CouponService.validateCoupon('INVALID', 100_000))
      .rejects
      .toMatchObject({ statusCode: 404, errorCode: 'COUPON_INVALID' });
  });

  // TC-WV-E02: Coupon chưa đến ngày sử dụng
  it('TC-WV-E02: ném lỗi khi coupon chưa đến ngày bắt đầu', async () => {
    const futureCoupon = makeFakeCoupon({
      start_date: new Date('2099-01-01'),
      end_date: new Date('2099-12-31'),
    });
    Coupon.findOne.mockResolvedValue(futureCoupon);

    await expect(CouponService.validateCoupon('TESTCODE', 100_000))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_NOT_STARTED' });
  });

  // TC-WV-E03: Coupon đã hết hạn
  it('TC-WV-E03: ném lỗi khi coupon đã hết hạn', async () => {
    const expiredCoupon = makeFakeCoupon({
      start_date: new Date('2020-01-01'),
      end_date: new Date('2021-01-01'),
    });
    Coupon.findOne.mockResolvedValue(expiredCoupon);

    await expect(CouponService.validateCoupon('TESTCODE', 100_000))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_EXPIRED' });
  });

  // TC-WV-E04: Đã hết tổng lượt sử dụng
  it('TC-WV-E04: ném lỗi khi đã đạt giới hạn tổng lượt dùng', async () => {
    const limitReachedCoupon = makeFakeCoupon({
      usage_limit: 100,
      used_count: 100, // used_count >= usage_limit
    });
    Coupon.findOne.mockResolvedValue(limitReachedCoupon);

    await expect(CouponService.validateCoupon('TESTCODE', 100_000))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_LIMIT_REACHED' });
  });

  // TC-WV-E05: Không đạt giá trị đơn tối thiểu
  it('TC-WV-E05: ném lỗi khi orderTotal < min_order_value', async () => {
    Coupon.findOne.mockResolvedValue(makeFakeCoupon({ min_order_value: 200_000 }));

    await expect(CouponService.validateCoupon('TESTCODE', 100_000)) // 100K < 200K
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_MIN_VALUE_NOT_MET' });
  });

  // ──────────────────────────────────────────────────────────────
  // NHÓM 2: Kiểm tra logic tính discount (Branch + Condition Coverage - Chapter 4.4)
  // ──────────────────────────────────────────────────────────────

  // TC-WV01: C1=True → type = FIXED
  it('TC-WV01 [C1=T]: tính discount đúng khi coupon type = FIXED', async () => {
    const coupon = makeFakeCoupon({ type: 'FIXED', value: 50_000 });
    Coupon.findOne.mockResolvedValue(coupon);

    const result = await CouponService.validateCoupon('TESTCODE', 200_000);

    expect(result.discountAmount).toBe(50_000);
    expect(result.finalPrice).toBe(150_000);
    expect(result.appliedOnAmount).toBe(200_000);
  });

  // TC-WV02: C1=False, C2=True, C3=True → type = PERCENT, có max_discount_value
  it('TC-WV02 [C2=T, C3=T]: discount bị giới hạn bởi max_discount_value khi type = PERCENT', async () => {
    const coupon = makeFakeCoupon({
      type: 'PERCENT',
      value: 50, // 50%
      max_discount_value: 30_000, // Giới hạn tối đa 30K
    });
    Coupon.findOne.mockResolvedValue(coupon);

    const result = await CouponService.validateCoupon('TESTCODE', 200_000);

    // 50% của 200K = 100K, nhưng bị giới hạn ở 30K
    expect(result.discountAmount).toBe(30_000);
    expect(result.finalPrice).toBe(170_000);
  });

  // TC-WV03: C1=False, C2=True, C3=False → type = PERCENT, không có max_discount_value
  it('TC-WV03 [C2=T, C3=F]: tính discount theo % đầy đủ khi không có max_discount_value', async () => {
    const coupon = makeFakeCoupon({
      type: 'PERCENT',
      value: 20, // 20%
      max_discount_value: null,
    });
    Coupon.findOne.mockResolvedValue(coupon);

    const result = await CouponService.validateCoupon('TESTCODE', 500_000);

    // 20% của 500K = 100K
    expect(result.discountAmount).toBe(100_000);
    expect(result.finalPrice).toBe(400_000);
  });

  // TC-WV04: C1=False, C2=False → type không hợp lệ → discount = 0
  it('TC-WV04 [C1=F, C2=F]: discount = 0 khi type không phải FIXED hay PERCENT', async () => {
    const coupon = makeFakeCoupon({ type: 'UNKNOWN_TYPE', value: 100_000 });
    Coupon.findOne.mockResolvedValue(coupon);

    const result = await CouponService.validateCoupon('TESTCODE', 500_000);

    expect(result.discountAmount).toBe(0);
    expect(result.finalPrice).toBe(500_000);
  });

  // TC-WV05: discountAmount không được vượt quá baseAmountForDiscount
  it('TC-WV05 [Đảm bảo]: discount không vượt quá tổng tiền áp dụng', async () => {
    const coupon = makeFakeCoupon({
      type: 'FIXED',
      value: 999_999, // Giá trị giảm lớn hơn orderTotal
    });
    Coupon.findOne.mockResolvedValue(coupon);

    const result = await CouponService.validateCoupon('TESTCODE', 100_000);

    // discountAmount phải bị giới hạn ở 100K (không âm)
    expect(result.discountAmount).toBeLessThanOrEqual(100_000);
    expect(result.finalPrice).toBeGreaterThanOrEqual(0);
  });

  // TC-WV06: Giá trị biên – orderTotal = min_order_value (đúng ngưỡng)
  it('TC-WV06 [BVA]: coupon hợp lệ khi orderTotal đúng bằng min_order_value', async () => {
    Coupon.findOne.mockResolvedValue(makeFakeCoupon({
      min_order_value: 100_000,
      type: 'FIXED',
      value: 20_000,
    }));

    const result = await CouponService.validateCoupon('TESTCODE', 100_000);

    expect(result.discountAmount).toBe(20_000);
    expect(result.finalPrice).toBe(80_000);
  });

  // TC-WV07: Giá trị biên – orderTotal = min_order_value - 1 (dưới ngưỡng)
  it('TC-WV07 [BVA]: ném lỗi khi orderTotal = min_order_value - 1', async () => {
    Coupon.findOne.mockResolvedValue(makeFakeCoupon({ min_order_value: 100_000 }));

    await expect(CouponService.validateCoupon('TESTCODE', 99_999))
      .rejects
      .toMatchObject({ errorCode: 'COUPON_MIN_VALUE_NOT_MET' });
  });

  // TC-WV08: PERCENT với max_discount_value – discount = min(percent_calc, max)
  it('TC-WV08: discount PERCENT không vượt quá max_discount_value', async () => {
    const coupon = makeFakeCoupon({
      type: 'PERCENT',
      value: 10, // 10%
      max_discount_value: 15_000,
    });
    Coupon.findOne.mockResolvedValue(coupon);

    const orderTotal = 200_000;
    const result = await CouponService.validateCoupon('TESTCODE', orderTotal);

    const percentCalc = (orderTotal * 10) / 100; // = 20,000
    const expected = Math.min(percentCalc, 15_000); // = 15,000

    expect(result.discountAmount).toBe(expected);
  });

  // ──────────────────────────────────────────────────────────────
  // NHÓM 3: Kiểm tra giới hạn người dùng & Danh mục sản phẩm (Advanced)
  // ──────────────────────────────────────────────────────────────

  // TC-WV09: Giới hạn lượt dùng theo từng người dùng (User limit)
  it('TC-WV09: ném lỗi khi người dùng đã hết lượt sử dụng mã này', async () => {
    const Order = require('../../schemas/Order.schema');
    const coupon = makeFakeCoupon({ usage_limit_per_user: 2 });
    Coupon.findOne.mockResolvedValue(coupon);

    // Giả lập người dùng đã dùng 2 lần
    Order.countDocuments.mockResolvedValue(2);

    await expect(CouponService.validateCoupon('TESTCODE', 100_000, 'user-123'))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_LIMIT_REACHED' });

    expect(Order.countDocuments).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-123' }));
  });

  // TC-WV10: Lỗi khi coupon có hạn chế danh mục nhưng cartItems trống
  it('TC-WV10: ném lỗi khi coupon yêu cầu danh mục nhưng giỏ hàng trống', async () => {
    const coupon = makeFakeCoupon({ applicable_categories: ['cat-1'] });
    Coupon.findOne.mockResolvedValue(coupon);

    await expect(CouponService.validateCoupon('TESTCODE', 100_000, 'user-123', []))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_INVALID' });
  });

  // TC-WV11: Lọc sản phẩm theo danh mục và tính discount trên baseAmount correct
  it('TC-WV11: chỉ tính giảm giá trên các sản phẩm thuộc danh mục hợp lệ', async () => {
    const Cake = require('../../schemas/Cake.schema');
    const coupon = makeFakeCoupon({
      applicable_categories: ['cat-1'],
      type: 'PERCENT',
      value: 10 // 10%
    });
    Coupon.findOne.mockResolvedValue(coupon);

    const cartItems = [
      { cake_id: 'cake-valid', quantity: 2, price_at_buy: 50_000 }, // 100K valid
      { cake_id: 'cake-invalid', quantity: 1, price_at_buy: 50_000 }, // 50K invalid
    ];

    Cake.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { _id: 'cake-valid', category_id: 'cat-1' },
        { _id: 'cake-invalid', category_id: 'cat-2' },
      ])
    });

    const result = await CouponService.validateCoupon('TESTCODE', 150_000, 'user-123', cartItems);

    // discount 10% chỉ áp dụng trên 100K = 10K
    expect(result.appliedOnAmount).toBe(100_000);
    expect(result.discountAmount).toBe(10_000);
    expect(result.finalPrice).toBe(140_000);
  });

  // TC-WV12: Ném lỗi khi không có sản phẩm nào trong giỏ thuộc danh mục áp dụng
  it('TC-WV12: ném lỗi khi không có sản phẩm nào hợp lệ để áp dụng mã', async () => {
    const Cake = require('../../schemas/Cake.schema');
    const coupon = makeFakeCoupon({ applicable_categories: ['cat-999'] });
    Coupon.findOne.mockResolvedValue(coupon);

    const cartItems = [{ cake_id: 'cake-1', quantity: 1, price_at_buy: 100_000 }];
    Cake.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: 'cake-1', category_id: 'cat-0' }])
    });

    await expect(CouponService.validateCoupon('TESTCODE', 100_000, 'user-123', cartItems))
      .rejects
      .toMatchObject({ statusCode: 400, errorCode: 'COUPON_INVALID' });
  });
});
