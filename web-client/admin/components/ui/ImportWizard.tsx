"use client";

import React, { useState } from "react";
import { Modal, Steps, Upload, Radio, Button, Progress, Result, Typography, Space, message, Table, Tag } from "antd";
import { InboxOutlined, FileExcelOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { importApi } from "../../modules/import/api";

const { Dragger } = Upload;
const { Text, Title, Link } = Typography;

interface ImportResult {
  success: boolean;
  historyId: string;
  stats: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
  previewErrors?: any[];
}

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  entityName: string;
  importFn: (file: File, mode: string) => Promise<any>;
  templateUrl?: string;
}

const ImportWizard: React.FC<ImportWizardProps> = ({
  open,
  onClose,
  onSuccess,
  entityName,
  importFn,
  templateUrl
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState("UPSERT");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleUpload = (info: any) => {
    if (info.fileList.length > 0) {
      setFile(info.fileList[0].originFileObj || info.file);
    } else {
      setFile(null);
    }
  };

  const startImport = async () => {
    if (!file) {
      message.error("Vui lòng chọn file Excel trước khi tiếp tục");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 200);

    try {
      const response = await importFn(file, importMode);
      setResult(response);
      setProgress(100);
      setCurrentStep(2);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      message.error(error.message || "Đã xảy ra lỗi trong quá trình import");
      setCurrentStep(0);
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setFile(null);
    setImportMode("UPSERT");
    setResult(null);
    setProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const downloadErrorReport = async () => {
    if (!result?.historyId) return;
    try {
      const blob = await importApi.downloadErrorReport(result.historyId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Error_Report_${result.historyId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tải báo cáo");
    }
  };

  return (
    <Modal
      title={`Import ${entityName} từ Excel`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      mask={{ closable: !isProcessing }}
    >
      <Steps
        current={currentStep}
        items={[
          { title: "Thiết lập" },
          { title: "Xử lý" },
          { title: "Kết quả" }
        ]}
        style={{ marginBottom: 32 }}
      />

      {currentStep === 0 && (
        <Space orientation="vertical" style={{ width: "100%" }} size="large">
          <section>
            <Title level={5}>1. Chọn chế độ nhập liệu</Title>
            <Radio.Group 
              onChange={(e) => setImportMode(e.target.value)} 
              value={importMode}
              optionType="button"
              buttonStyle="solid"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="UPSERT">
                  <Text strong>Ghi đè & Thêm mới (Upsert)</Text>
                  <br />
                  <Text type="secondary">Tìm theo ID trong Excel. Nếu tồn tại sẽ cập nhật, nếu không sẽ tạo mới (Hệ thống tự sinh ID mới).</Text>
                </Radio>
                <Radio value="INSERT_ONLY">
                  <Text strong>Chỉ thêm mới (Insert Only)</Text>
                  <br />
                  <Text type="secondary" className="text-blue-600">
                    <CheckCircleOutlined /> Hệ thống luôn tạo mới. <span className="font-bold">Lưu ý:</span> Bạn không cần nhập ID sản phẩm.
                  </Text>
                </Radio>
                <Radio value="UPDATE_ONLY">
                  <Text strong>Chỉ cập nhật (Update Only)</Text>
                  <br />
                  <Text type="secondary">Yêu cầu nhập ID sản phẩm chính xác. Nếu không tìm thấy, hệ thống sẽ bỏ qua (Skip).</Text>
                </Radio>
              </Space>
            </Radio.Group>
          </section>

          <section>
            <Title level={5}>2. Tải file dữ liệu</Title>
            <Dragger
              name="file"
              multiple={false}
              accept=".xlsx,.xls,.csv"
              beforeUpload={() => false}
              onChange={handleUpload}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc click để chọn file Excel</p>
              <p className="ant-upload-hint">Hỗ trợ các định dạng .xlsx, .xls, .csv</p>
            </Dragger>
            {templateUrl && (
              <div style={{ marginTop: 8 }}>
                <Link href={templateUrl} target="_blank">
                  <FileExcelOutlined /> Tải file mẫu cho {entityName}
                </Link>
              </div>
            )}
          </section>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Button size="large" onClick={handleClose} style={{ marginRight: 8 }}>Hủy</Button>
            <Button size="large" type="primary" onClick={startImport} disabled={!file}>Tiếp tục</Button>
          </div>
        </Space>
      )}

      {currentStep === 1 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Title level={4}>Đang xử lý dữ liệu...</Title>
          <Text type="secondary">Vui lòng không đóng trình duyệt cho đến khi hoàn tất.</Text>
          <div style={{ marginTop: 32 }}>
            <Progress type="circle" percent={progress} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} />
          </div>
          <div style={{ marginTop: 24 }}>
            <Text italic>Hệ thống đang lưu trữ dữ liệu vào database theo từng batch...</Text>
          </div>
        </div>
      )}

      {currentStep === 2 && result && (
        <Result
          status={result.stats.failed > 0 ? "warning" : "success"}
          title={`Hoàn tất Import ${entityName}`}
          subTitle={`Thời gian xử lý: ${(progress/10).toFixed(1)}s. Xem chi tiết bên dưới.`}
          extra={[
            <Button type="primary" key="close" onClick={handleClose}>Hoàn tất</Button>,
            <Button key="again" onClick={reset}>Tiếp tục Import khác</Button>
          ]}
        >
          <div style={{ background: "#f5f5f5", padding: 24, borderRadius: 8 }}>
            <Space size="large" style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0 }}>{result.stats.total}</Title>
                <Text type="secondary">Tổng số dòng</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0, color: "#52c41a" }}>{result.stats.success}</Title>
                <Text type="secondary">Thành công</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0, color: "#faad14" }}>{result.stats.skipped}</Title>
                <Text type="secondary">Bỏ qua</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>{result.stats.failed}</Title>
                <Text type="secondary">Thất bại</Text>
              </div>
            </Space>

            {result.stats.failed > 0 && (
              <div style={{ marginTop: 24 }}>
                <Text type="danger" strong>
                  <WarningOutlined /> Phát hiện lỗi dữ liệu ở một số dòng. Xem nhanh 10 lỗi đầu tiên bên dưới hoặc tải báo cáo đầy đủ.
                </Text>

                {result.previewErrors && result.previewErrors.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Table 
                      size="small"
                      dataSource={result.previewErrors}
                      pagination={false}
                      rowKey={(record) => `error-${record.row}`}
                      columns={[
                        { title: "Dòng", dataIndex: "row", key: "row", width: 70 },
                        { 
                          title: "Sản phẩm", 
                          key: "product",
                          render: (_: any, record: any) => record.rawData?.name || "N/A"
                        },
                        { 
                          title: "Chi tiết lỗi", 
                          dataIndex: "message", 
                          key: "message",
                          render: (text) => <Text type="danger">{text}</Text>
                        }
                      ]}
                    />
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Button danger icon={<FileExcelOutlined />} onClick={downloadErrorReport}>Tải báo cáo lỗi đầy đủ (.xlsx)</Button>
                </div>
              </div>
            )}
          </div>
        </Result>
      )}
    </Modal>
  );
};

export default ImportWizard;
