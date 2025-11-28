import { useState, useEffect, useRef } from "react";
import { Card, Button, Skeleton, Typography, App, Space, Alert } from "antd";
import { SaveOutlined, UndoOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { stipulationService } from "@/services/stipulationService";
import type { StipulationResponse } from "@/services/stipulationService";
import RichTextToolbar from "@/components/common/RichTextToolbar";

const { Title, Text } = Typography;

export default function StipulationSettings() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stipulation, setStipulation] = useState<StipulationResponse | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStipulation();
  }, []);

  // Set editor content when stipulation data is loaded
  useEffect(() => {
    if (editorRef.current && stipulation && !hasChanges) {
      editorRef.current.innerHTML = removeCiteTags(stipulation.content);
    }
  }, [stipulation, hasChanges]);

  const fetchStipulation = async () => {
    setLoading(true);
    try {
      const data = await stipulationService.getStipulationForAdmin();
      setStipulation(data);
      setOriginalContent(data.content);
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error fetching stipulation:", error);
      message.error("Không thể tải điều khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Function to remove [cite:...] tags from HTML content
  const removeCiteTags = (html: string): string => {
    if (!html) return html;
    // Remove [cite_start] tags
    let cleaned = html.replace(/\[cite_start\]/g, '');
    // Remove [cite: number] or [cite: number, number, ...] tags
    cleaned = cleaned.replace(/\[cite:\s*[\d,\s]+\]/g, '');
    return cleaned;
  };

  const handleContentChange = () => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editorRef.current) {
      message.error("Không thể lưu nội dung. Vui lòng thử lại.");
      return;
    }

    const newContent = editorRef.current.innerHTML;
    
    if (!newContent.trim()) {
      message.error("Nội dung không được để trống.");
      return;
    }

    setSaving(true);
    try {
      await stipulationService.updateStipulation(newContent);
      setOriginalContent(newContent);
      setHasChanges(false);
      message.success("Đã lưu điều khoản thành công");
      fetchStipulation(); // Refresh data
    } catch (error: any) {
      console.error("Error saving stipulation:", error);
      message.error("Không thể lưu điều khoản. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (editorRef.current && originalContent) {
      editorRef.current.innerHTML = originalContent;
      setHasChanges(false);
      message.info("Đã khôi phục nội dung ban đầu");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Quản lý điều khoản dịch vụ</Title>
        <Text type="secondary">
          Chỉnh sửa nội dung điều khoản và điều kiện sử dụng dịch vụ. 
        </Text>
      </div>

      {/* <Alert
        message="Hướng dẫn sử dụng"
        description={
          <div className="space-y-2">
            <p><strong>Thanh công cụ định dạng:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Hoàn tác/Làm lại:</strong> Quay lại hoặc khôi phục thao tác</li>
              <li><strong>Định dạng đoạn:</strong> Chọn tiêu đề (H1-H6) hoặc văn bản thường</li>
              <li><strong>Cỡ chữ:</strong> Thay đổi kích thước chữ từ 10px đến 32px</li>
              <li><strong>In đậm, nghiêng, gạch chân:</strong> Định dạng văn bản cơ bản</li>
              <li><strong>Màu chữ/nền:</strong> Thay đổi màu sắc văn bản và highlight</li>
              <li><strong>Danh sách:</strong> Tạo danh sách có đánh số hoặc không đánh số</li>
              <li><strong>Căn lề:</strong> Căn trái, giữa, phải hoặc đều hai bên</li>
              <li><strong>Thụt lề:</strong> Tăng hoặc giảm thụt đầu dòng</li>
            </ul>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        className="mb-4"
        closable
      /> */}

      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Nội dung điều khoản</span>
            {hasChanges && (
              <span className="text-orange-500 text-sm font-normal">
                • Có thay đổi chưa lưu
              </span>
            )}
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<UndoOutlined />}
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              Khôi phục
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              Lưu thay đổi
            </Button>
          </Space>
        }
        styles={{
          body: { padding: 0 }
        }}
      >
        {/* Rich Text Toolbar */}
        <RichTextToolbar 
          editorRef={editorRef as React.RefObject<HTMLDivElement>}
          onContentChange={handleContentChange}
          disabled={saving}
        />

        {/* Editable Content Area */}
        <div
          ref={editorRef}
          contentEditable={!saving}
          suppressContentEditableWarning
          className="p-6 min-h-[600px] focus:outline-none border-t-0"
          style={{ 
            fontSize: "14px", 
            lineHeight: "1.8",
            backgroundColor: "#ffffff",
            color: "#000000"
          }}
          onInput={handleContentChange}
        />

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Text type="secondary" className="text-xs">
            <InfoCircleOutlined className="mr-1" />
            Nội dung được lưu dưới dạng HTML. Sử dụng các phím tắt: Ctrl+B (in đậm), Ctrl+I (in nghiêng), Ctrl+U (gạch chân), Ctrl+Z (hoàn tác).
          </Text>
        </div>
      </Card>
    </div>
  );
}
