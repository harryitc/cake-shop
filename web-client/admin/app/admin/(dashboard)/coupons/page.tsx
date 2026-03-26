import CouponModule from '@/modules/coupons/CouponModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý Mã giảm giá | Admin Portal',
};

export default function CouponsPage() {
  return <CouponModule />;
}
