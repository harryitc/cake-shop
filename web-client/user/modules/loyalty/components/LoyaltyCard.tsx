import { Card, Tag, Table, Typography, Progress } from "antd";
import { TrophyOutlined, HistoryOutlined, StarOutlined } from "@ant-design/icons";
import { useLoyaltyQuery } from "../hooks";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const RANK_COLORS = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  DIAMOND: "#b9f2ff",
};

const NEXT_TIER_THRESHOLDS = {
  BRONZE: { next: "SILVER", min: 2000000 },
  SILVER: { next: "GOLD", min: 5000000 },
  GOLD: { next: "DIAMOND", min: 10000000 },
  DIAMOND: { next: null, min: 0 },
};

export const LoyaltyCard = () => {
  const { data, isLoading } = useLoyaltyQuery();

  if (isLoading) return <Card loading />;

  const rank = data?.rank || "BRONZE";
  const points = data?.loyalty_points || 0;
  const spent = data?.total_spent || 0;
  
  const nextTier = NEXT_TIER_THRESHOLDS[rank as keyof typeof NEXT_TIER_THRESHOLDS];
  const percent = nextTier.next ? Math.min((spent / nextTier.min) * 100, 100) : 100;

  return (
    <div className="flex flex-col gap-6">
      <Card 
        className="rounded-2xl shadow-sm border-none overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div 
          className="p-6 text-white" 
          style={{ 
            background: `linear-gradient(135deg, ${RANK_COLORS[rank as keyof typeof RANK_COLORS]}, #2c3e50)` 
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-white/80 uppercase text-xs font-bold tracking-widest">Hạng Thành Viên</Text>
              <Title level={2} className="!text-white !m-0 !mt-1 flex items-center gap-2">
                <TrophyOutlined /> {rank}
              </Title>
            </div>
            <div className="text-right">
              <Text className="text-white/80 text-xs font-bold tracking-widest uppercase">Điểm Tích Lũy</Text>
              <Title level={3} className="!text-white !m-0 !mt-1">{points.toLocaleString()} pts</Title>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-xs mb-2">
              <Text className="text-white/90 font-medium">Tiến trình lên hạng {nextTier.next || "MAX"}</Text>
              <Text className="text-white/90">{spent.toLocaleString()} / {nextTier.min.toLocaleString()} VNĐ</Text>
            </div>
            <Progress 
              percent={percent} 
              showInfo={false} 
              strokeColor="#fff" 
              trailColor="rgba(255,255,255,0.2)"
              strokeWidth={8}
            />
          </div>
        </div>
      </Card>

      <Card 
        className="rounded-2xl shadow-sm border-gray-100" 
        title={<span className="font-bold flex items-center gap-2"><HistoryOutlined /> Lịch sử điểm thưởng</span>}
      >
        <Table 
          dataSource={data?.history || []}
          rowKey="_id"
          pagination={false}
          size="small"
          columns={[
            {
              title: "Ngày",
              dataIndex: "createdAt",
              render: (date) => dayjs(date).format("DD/MM/YYYY"),
            },
            {
              title: "Lý do",
              dataIndex: "reason",
            },
            {
              title: "Điểm",
              dataIndex: "points_change",
              render: (points, record) => (
                <Text type={record.type === "PLUS" ? "success" : "danger"} className="font-bold">
                  {record.type === "PLUS" ? "+" : ""}{points.toLocaleString()}
                </Text>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
