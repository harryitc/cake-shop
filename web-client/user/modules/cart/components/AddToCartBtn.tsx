"use client";

import { Button, App } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useAddToCartMutation } from "../hooks";
import { usePathname, useRouter } from "next/navigation";

export const AddToCartBtn = ({ cakeId, quantity = 1, variantId = null, className }: { cakeId: string; quantity?: number; variantId?: string | null; className?: string }) => {
  const { message } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate, isPending } = useAddToCartMutation();

  const handleAdd = () => {
    // Không cần check token ở đây nữa, vì hook useAddToCartMutation đã xử lý việc switch giữa local và api
    mutate(
      { cake_id: cakeId, quantity, variant_id: variantId },
      {
        onSuccess: () => {
          message.success("Đã thêm vào giỏ hàng!");
        },
        onError: (err: any) => {
          message.error(err.message || "Thêm vào giỏ thất bại");
        },
      }
    );
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<ShoppingCartOutlined />}
      onClick={handleAdd}
      loading={isPending}
      className={className || "bg-indigo-600 hover:bg-indigo-700 shadow-lg font-semibold rounded-lg h-12 px-8"}
    >
      Thêm vào giỏ
    </Button>
  );
};
