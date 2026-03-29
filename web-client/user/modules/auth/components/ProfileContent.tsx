"use client";

import { App, Spin } from "antd";
import { useMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from "../hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Components
import { ProfileSidebar } from "./ProfileSidebar";
import { OverviewSection } from "./profile-sections/OverviewSection";
import { SecuritySection } from "./profile-sections/SecuritySection";
import { OrdersSection } from "./profile-sections/OrdersSection";
import { RewardsSection } from "./profile-sections/RewardsSection";
import { AddressSection } from "./profile-sections/AddressSection";

const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  newPassword: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp!",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfileContent = () => {
  const { message } = App.useApp();
  const { data: user, isLoading } = useMeQuery();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPass } = useChangePasswordMutation();

  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    getValues,
    formState: { isDirty: isProfileDirty, isValid: isProfileValid }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { name: "", phone: "", address: "", avatar: "" }
  });

  const {
    control: passControl,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors, isDirty: isPassDirty, isValid: isPassValid }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" }
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = (values: ProfileFormValues) => {
    const payload = {
      full_name: values.name,
      phone: values.phone,
      address: values.address,
      avatar_url: values.avatar
    };
    updateProfile(payload, {
      onSuccess: () => {
        message.success("Cập nhật thông tin thành công");
        resetProfile(values);
      },
      onError: (err: any) => message.error(err.message || "Lỗi cập nhật"),
    });
  };

  const onChangePassword = (values: PasswordFormValues) => {
    changePassword(values as any, {
      onSuccess: () => {
        message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
        setIsPassModalOpen(false);
        resetPass();
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      },
      onError: (err: any) => message.error(err.message || "Lỗi đổi mật khẩu"),
    });
  };

  const handleUpdateAvatar = (path: string) => {
    updateProfile({ avatar_url: path }, {
      onSuccess: () => {
        message.success("Cập nhật ảnh đại diện thành công");
        // Reset form để lấy avatar mới vào state của react-hook-form
        if (user) {
          resetProfile({
            ...getValues(),
            avatar: path
          });
        }
      },
      onError: (err: any) => message.error(err.message || "Lỗi cập nhật ảnh"),
    });
  };

  if (isLoading) return <div className="flex justify-center p-20 min-h-screen items-center bg-gray-50/30"><Spin size="large" /></div>;

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            user={user}
            profileControl={profileControl}
            handleProfileSubmit={handleProfileSubmit}
            onUpdateProfile={onUpdateProfile}
            isUpdating={isUpdating}
            isProfileDirty={isProfileDirty}
            isProfileValid={isProfileValid}
            updateProfileAvatar={handleUpdateAvatar}
          />
        );
      case "orders":
        return <OrdersSection />;
      case "address":
        return (
          <AddressSection
            profileControl={profileControl}
            handleProfileSubmit={handleProfileSubmit}
            onUpdateProfile={onUpdateProfile}
            isUpdating={isUpdating}
            isProfileDirty={isProfileDirty}
            isProfileValid={isProfileValid}
          />
        );
      case "rewards":
        return <RewardsSection />;
      case "security":
        return (
          <SecuritySection
            passControl={passControl}
            handlePassSubmit={handlePassSubmit}
            onChangePassword={onChangePassword}
            isChangingPass={isChangingPass}
            isPassDirty={isPassDirty}
            isPassValid={isPassValid}
            passErrors={passErrors}
            isPassModalOpen={isPassModalOpen}
            setIsPassModalOpen={setIsPassModalOpen}
          />
        );
      default:
        return null;
    }
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "overview": return "Hồ sơ cá nhân";
      case "orders": return "Đơn hàng của mình";
      case "address": return "Sổ địa chỉ";
      case "rewards": return "Ưu đãi thành viên";
      case "security": return "Bảo mật tài khoản";
      default: return "";
    }
  }

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 h-full lg:sticky lg:top-4">
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 min-h-[500px] flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-7 bg-gradient-to-b from-[#D4AF37] to-[#F1B24A] rounded-full shadow-md shadow-[#D4AF37]/20" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight m-0">{getPageTitle(activeTab)}</h1>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};
