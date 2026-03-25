"use client";

import { Button, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useAddToCartMutation } from "../hooks";
import { useRouter } from "next/navigation";

export const AddToCartBtn = ({ cakeId, quantity = 1 }: { cakeId: string; quantity?: number }) => {
  const router = useRouter();
  const { mutate, isPending } = useAddToCartMutation();

  const handleAdd = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      message.warning("Vui lòng đăng nhập để mua hàng");
      router.push("/login");
      return;
    }

    mutate(
      { cake_id: cakeId, quantity },
      {
        onSuccess: () => {
          message.success("Đã thêm vào giỏ hàng!");
        },
        onError: (err) => {
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
      className="bg-indigo-600 hover:bg-indigo-700 shadow-lg font-semibold rounded-lg h-12 px-8"
    >
      Thêm vào giỏ
    </Button>
  );
};
