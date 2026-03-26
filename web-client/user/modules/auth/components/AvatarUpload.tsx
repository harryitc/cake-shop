"use client";

import { Upload, App } from "antd";
import ImgCrop from "antd-img-crop";
import { UserOutlined, LoadingOutlined, CameraOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useUploadImageMutation } from "../../cakes/hooks";

interface AvatarUploadProps {
  value?: string;
  onChange?: (path: string) => void;
}

const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || "http://localhost:5000";

export const AvatarUpload = ({ value, onChange }: AvatarUploadProps) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { mutate: uploadImage } = useUploadImageMutation();

  const handleUpload = (file: File) => {
    setLoading(true);
    uploadImage(file, {
      onSuccess: (data) => {
        if (onChange) onChange(data.path);
        message.success("Cập nhật ảnh đại diện thành công");
        setLoading(false);
      },
      onError: (err) => {
        message.error(err.message || "Lỗi upload ảnh");
        setLoading(false);
      },
    });
    return false;
  };

  const imageUrl = value 
    ? (value.startsWith("http") ? value : `${API_DOMAIN}${value}`)
    : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <ImgCrop rotationSlider aspect={1}>
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          {imageUrl ? (
            <div className="relative group w-full h-full rounded-full overflow-hidden">
              <img src={imageUrl} alt="avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraOutlined className="text-white text-xl" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {loading ? <LoadingOutlined /> : <UserOutlined className="text-2xl text-gray-400" />}
              <div className="mt-2 text-xs text-gray-500 font-medium">{loading ? "Đang tải" : "Tải ảnh"}</div>
            </div>
          )}
        </Upload>
      </ImgCrop>
      <p className="text-xs text-gray-400 italic text-center">
        * Nhấn vào vòng tròn để đổi ảnh đại diện (Tỉ lệ 1:1)
      </p>
    </div>
  );
};
