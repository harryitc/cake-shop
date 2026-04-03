/**
 * Unit Tests cho loyalty.service.js – checkTierUpgrade
 * Chương 5 - Kiểm thử phần mềm
 *
 * Kỹ thuật áp dụng: Condition Coverage (Chapter 4.3)
 */

// ────────────────────────────────────────────────────────────────
// Mock các module phụ thuộc
// ────────────────────────────────────────────────────────────────
jest.mock('../../schemas/User.schema.js');
jest.mock('../../schemas/Order.schema.js');
jest.mock('../../schemas/PointHistory.schema.js');
jest.mock('../../schemas/LoyaltyConfig.schema.js');
jest.mock('../../config/constants', () => {
  const actual = jest.requireActual('../../config/constants');
  return {
    ...actual,
    LOYALTY_RANKS: {
      BRONZE: 'BRONZE',
      SILVER: 'SILVER',
      GOLD: 'GOLD',
      DIAMOND: 'DIAMOND',
    },
    POINT_TYPES: {
      PLUS: 'PLUS',
      MINUS: 'MINUS',
    },
  };
});

const User = require('../../schemas/User.schema.js');
const { LOYALTY_RANKS } = require('../../config/constants');

// Import LoyaltyService sau khi mock đã được thiết lập
const LoyaltyService = require('../../services/loyalty.service');

// ────────────────────────────────────────────────────────────────
// Hằng số ngưỡng cấp bậc (Tier Thresholds)
// ────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  [LOYALTY_RANKS.SILVER]: 5_000_000,
  [LOYALTY_RANKS.GOLD]: 20_000_000,
  [LOYALTY_RANKS.DIAMOND]: 50_000_000,
};

/** Tạo mock config cho LoyaltyService */
const mockConfig = {
  tier_thresholds: THRESHOLDS,
  point_ratios: {
    BRONZE: 0.01,
    SILVER: 0.015,
    GOLD: 0.02,
    DIAMOND: 0.025,
  },
};

// ────────────────────────────────────────────────────────────────
// TEST SUITE: checkTierUpgrade
// ────────────────────────────────────────────────────────────────
describe('loyalty.service – checkTierUpgrade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cache của LoyaltyService
    LoyaltyService.config = mockConfig;
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT01: C_A = True → user = null → return void
  // ──────────────────────────────────────────────────────────────
  it('TC-WT01 [C_A=T]: trả về void khi user không tồn tại', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });

    const result = await LoyaltyService.checkTierUpgrade('non-existent-id');

    expect(result).toBeUndefined();
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT02: C_B = True → rank_lock = true → return void
  // ──────────────────────────────────────────────────────────────
  it('TC-WT02 [C_B=T]: trả về void khi rank_lock = true (hạng bị khóa)', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-1',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: true,
        total_spent: 0,
      }),
    });

    const result = await LoyaltyService.checkTierUpgrade('user-1');

    expect(result).toBeUndefined();
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT03: C1 = True → total_spent >= DIAMOND → nâng hạng DIAMOND
  // ──────────────────────────────────────────────────────────────
  it('TC-WT03 [C1=T]: nâng hạng lên DIAMOND khi total_spent >= 50,000,000', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-2',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 60_000_000,
      }),
    });
    User.updateOne.mockResolvedValue({});

    await LoyaltyService.checkTierUpgrade('user-2');

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-2' },
      { $set: { rank: LOYALTY_RANKS.DIAMOND } },
      expect.anything()
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT04: C2 = True → total_spent >= GOLD (nhưng < DIAMOND) → nâng hạng GOLD
  // ──────────────────────────────────────────────────────────────
  it('TC-WT04 [C1=F, C2=T]: nâng hạng lên GOLD khi 20M <= total_spent < 50M', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-3',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 25_000_000,
      }),
    });
    User.updateOne.mockResolvedValue({});

    await LoyaltyService.checkTierUpgrade('user-3');

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-3' },
      { $set: { rank: LOYALTY_RANKS.GOLD } },
      expect.anything()
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT05: C3 = True → total_spent >= SILVER (nhưng < GOLD) → nâng hạng SILVER
  // ──────────────────────────────────────────────────────────────
  it('TC-WT05 [C2=F, C3=T]: nâng hạng lên SILVER khi 5M <= total_spent < 20M', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-4',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 8_000_000,
      }),
    });
    User.updateOne.mockResolvedValue({});

    await LoyaltyService.checkTierUpgrade('user-4');

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-4' },
      { $set: { rank: LOYALTY_RANKS.SILVER } },
      expect.anything()
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT06: C3 = False → total_spent < SILVER → giữ nguyên BRONZE
  // ──────────────────────────────────────────────────────────────
  it('TC-WT06 [C3=F, C4=F]: không nâng hạng khi total_spent < 5,000,000', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-5',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 500_000,
      }),
    });

    await LoyaltyService.checkTierUpgrade('user-5');

    expect(User.updateOne).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT07: C4 = False → newRank không cao hơn rank hiện tại → không cập nhật
  // ──────────────────────────────────────────────────────────────
  it('TC-WT07 [C4=F]: không cập nhật khi user đã ở hạng cao hơn hoặc bằng hạng tính được', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-6',
        rank: LOYALTY_RANKS.DIAMOND, // Đã là DIAMOND
        rank_lock: false,
        total_spent: 25_000_000, // Nếu tính lại → GOLD, nhưng GOLD < DIAMOND → không downgrade
      }),
    });

    await LoyaltyService.checkTierUpgrade('user-6');

    expect(User.updateOne).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT08: Kiểm tra giá trị biên – total_spent đúng bằng ngưỡng SILVER
  // ──────────────────────────────────────────────────────────────
  it('TC-WT08 [BVA]: nâng hạng SILVER khi total_spent = 5,000,000 (đúng ngưỡng)', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-7',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 5_000_000, // Đúng bằng ngưỡng SILVER
      }),
    });
    User.updateOne.mockResolvedValue({});

    await LoyaltyService.checkTierUpgrade('user-7');

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-7' },
      { $set: { rank: LOYALTY_RANKS.SILVER } },
      expect.anything()
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TC-WT09: total_spent = ngưỡng SILVER - 1 → không nâng hạng
  // ──────────────────────────────────────────────────────────────
  it('TC-WT09 [BVA]: không nâng hạng khi total_spent = 4,999,999 (dưới ngưỡng 1 đơn vị)', async () => {
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue({
        _id: 'user-8',
        rank: LOYALTY_RANKS.BRONZE,
        rank_lock: false,
        total_spent: 4_999_999, // Dưới ngưỡng SILVER đúng 1 VNĐ
      }),
    });

    await LoyaltyService.checkTierUpgrade('user-8');

    expect(User.updateOne).not.toHaveBeenCalled();
  });
});
