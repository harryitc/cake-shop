"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal, Form, Input, message } from "antd";
import { useCreateOrderMutation } from "../hooks";
import { useRouter } from "next/navigation";

const checkoutSchema = z.object({
  address: z.string().min(5, "Địa chỉ phải đủ chi tiết (ít nhất 5 ký tự)"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onCancel: () => void;
}

export const CheckoutModal = ({ open, onCancel }: CheckoutModalProps) => {
  const router = useRouter();
  const { mutate, isPending } = useCreateOrderMutation();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: "" },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    mutate(values, {
      onSuccess: () => {
        message.success("Đặt hàng thành công!");
        reset();
        onCancel();
        router.push("/orders");
      },
      onError: (err) => {
        message.error(err.message || "Đặt hàng thất bại");
      },
    });
  };

  return (
    <Modal
      title={<span className="text-xl font-bold">Xác nhận Đặt hàng</span>}
      open={open}
      onCancel={onCancel}
      confirmLoading={isPending}
      onOk={() => handleSubmit(onSubmit)()}
      okText="Xác nhận & Đặt mua"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-semibold" }}
    >
      <div className="py-4">
        <p className="text-gray-600 mb-4">
          Vui lòng nhập địa chỉ giao hàng. Bạn sẽ thanh toán cho shipper (COD) khi nhận bánh.
        </p>
        <Form layout="vertical">
          <Form.Item
            label="Địa chỉ giao hàng đầy đủ"
            validateStatus={errors.address ? "error" : ""}
            help={errors.address?.message}
            required
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input.TextArea 
                  {...field} 
                  autoSize={{ minRows: 3, maxRows: 5 }} 
                  placeholder="Ví dụ: 12 Đường ABC, Phường X, Quận Y, TP HCM" 
                  className="rounded-lg text-lg"
                />
              )}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
