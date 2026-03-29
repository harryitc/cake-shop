"use client";

import { Card, Table, Typography, Tag, Skeleton } from "antd";
import { HistoryOutlined, StarOutlined, RocketOutlined, GiftOutlined } from "@ant-design/icons";
import { useLoyaltyQuery } from "@/modules/loyalty/hooks";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const { Text } = Typography;

export const RewardsSection = () => {
  const { data, isLoading } = useLoyaltyQuery();

  if (isLoading) return <div className="p-10 bg-white rounded-3xl"><Skeleton active /></div>;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-3xl shadow-xl shadow-gray-200/50 border-none bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8">
              <GiftOutlined className="text-8xl text-white/10 -rotate-12 translate-x-8 -translate-y-8" />
           </div>
           <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                 <h3 className="text-2xl font-black text-white m-0">Ưu đãi hiện có</h3>
                 <p className="text-indigo-100 font-medium m-0 mt-2 italic shadow-sm">Bạn đang có {(data?.points ?? 0).toLocaleString()} điểm tích lũy</p>
              </div>
              <div className="mt-12 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
                 <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Mẹo nhỏ:</p>
                 <p className="text-white/80 text-sm font-medium m-0">Đổi điểm lấy mã giảm giá khi đặt hàng để tiết kiệm chi phí nhé!</p>
              </div>
           </div>
        </Card>

        <Card className="rounded-3xl shadow-xl shadow-gray-200/50 border-none bg-white/90 backdrop-blur-sm p-6 overflow-hidden flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm mb-4">
              <RocketOutlined className="text-3xl text-amber-500" />
           </div>
           <h3 className="text-xl font-black text-gray-800 m-0">Cách tích lũy</h3>
           <p className="text-gray-400 font-medium m-0 mt-2 px-10">Mỗi 10,000 VNĐ chi tiêu sẽ nhận lại bộ sưu tập điểm thưởng Cake Point!</p>
        </Card>
      </div>

      <Card 
        className="rounded-3xl shadow-xl shadow-gray-200/50 border-none bg-white/80 backdrop-blur-md" 
        title={<span className="font-black text-xl text-gray-800 flex items-center gap-3"><HistoryOutlined className="text-indigo-500" /> Biến động điểm thưởng</span>}
      >
        <Table 
          dataSource={data?.history || []}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="custom-table"
          columns={[
            {
              title: <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thời gian</span>,
              dataIndex: "createdAt",
              render: (date) => (
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">{dayjs(date).format("DD/MM/YYYY")}</span>
                  <span className="text-xs text-gray-400 font-medium">{dayjs(date).format("HH:mm")}</span>
                </div>
              ),
            },
            {
              title: <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nội dung</span>,
              dataIndex: "reason",
              render: (text) => <span className="font-bold text-gray-700">{text}</span>
            },
            {
              title: <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số điểm</span>,
              dataIndex: "points",
              align: "right",
              render: (pts, record) => (
                <div className="flex flex-col items-end">
                  <div className={cn(
                    "px-3 py-1 rounded-full font-black text-sm border-2",
                    record.type === "PLUS" 
                      ? "bg-green-50 text-green-600 border-green-100" 
                      : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    {record.type === "PLUS" ? "+" : "-"}{(pts ?? 0).toLocaleString()}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
