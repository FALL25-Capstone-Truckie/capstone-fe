import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Spin,
  Typography,
  Divider,
  Alert,
  Popconfirm,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileTextOutlined,
  ReloadOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import contractSettingService from "@/services/contract/contractSettingService";
import type { StipulationSettings } from "@/models/Contract";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface StipulationItem {
  key: string;
  value: string;
}

const ContractStipulation: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stipulations, setStipulations] = useState<StipulationItem[]>([]);
  const editorRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const service = contractSettingService();

  useEffect(() => {
    fetchStipulationSettings();
  }, []);

  const fetchStipulationSettings = async () => {
    setLoading(true);
    try {
      const response = await service.getStipulationSettings();

      if (response.success && response.data) {
        // Convert the contents object to array format for easier management
        const items: StipulationItem[] = Object.entries(
          response.data.contents || {}
        ).map(([key, value]) => ({
          key,
          value,
        }));
        setStipulations(items.length > 0 ? items : [{ key: "", value: "" }]);
      } else {
        setStipulations([{ key: "", value: "" }]);
      }
    } catch (error) {
      message.error("Tải điều khoản hợp đồng thất bại");
      setStipulations([{ key: "", value: "" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStipulation = () => {
    setStipulations([...stipulations, { key: "", value: "" }]);
  };

  const handleRemoveStipulation = (index: number) => {
    const newStipulations = stipulations.filter((_, i) => i !== index);
    setStipulations(
      newStipulations.length > 0 ? newStipulations : [{ key: "", value: "" }]
    );
  };

  const handleStipulationChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newStipulations = [...stipulations];
    newStipulations[index][field] = value;
    setStipulations(newStipulations);
  };

  // Text formatting functions
  const applyFormat = (index: number, command: string, value?: string) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, value);

    // Update the state with the new HTML content
    const newStipulations = [...stipulations];
    newStipulations[index].value = editor.innerHTML;
    setStipulations(newStipulations);
  };

  const handleEditorInput = (index: number, html: string) => {
    const newStipulations = [...stipulations];
    newStipulations[index].value = html;
    setStipulations(newStipulations);
  };

  const handleSave = async () => {
    // Validate that all stipulations have both key and value
    const invalidItems = stipulations.filter(
      (item) =>
        (item.key.trim() === "" && item.value.trim() !== "") ||
        (item.key.trim() !== "" && item.value.trim() === "")
    );

    if (invalidItems.length > 0) {
      message.warning("Vui lòng điền đầy đủ tên và nội dung điều khoản");
      return;
    }

    // Filter out empty items
    const validStipulations = stipulations.filter(
      (item) => item.key.trim() !== "" && item.value.trim() !== ""
    );

    if (validStipulations.length === 0) {
      message.warning("Vui lòng thêm ít nhất một điều khoản");
      return;
    }

    // Convert array back to object format for API
    const contents: Record<string, string> = {};
    validStipulations.forEach((item) => {
      contents[item.key] = item.value;
    });

    setSaving(true);
    try {
      const response = await service.updateStipulationSettings({ contents });
      if (response.success) {
        message.success("Cập nhật điều khoản hợp đồng thành công");
        await fetchStipulationSettings();
      } else {
        message.error(
          response.message || "Cập nhật điều khoản hợp đồng thất bại"
        );
      }
    } catch (error) {
      console.error("Error updating stipulation settings:", error);
      message.error("Cập nhật điều khoản hợp đồng thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <Card
        className="shadow-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={4} className="mb-0">
                Soạn thảo điều khoản hợp đồng
              </Title>
              <Text type="secondary" className="text-sm">
                Quản lý và chỉnh sửa các điều khoản mặc định cho hợp đồng
              </Text>
            </div>
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchStipulationSettings}
              disabled={loading || saving}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={loading}
            >
              Lưu thay đổi
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Alert
            message="Hướng dẫn"
            description={
              <div>
                <p>
                  Thêm các điều khoản hợp đồng bằng cách nhập tên điều khoản (ví
                  dụ: dieukhoan1, dieukhoan2) và nội dung tương ứng.
                </p>
                <p className="mb-0 mt-2">
                  <strong>Định dạng văn bản:</strong> Sử dụng toolbar để định
                  dạng văn bản thực tế với <strong>in đậm</strong>,{" "}
                  <em>in nghiêng</em>,<u>gạch chân</u>, danh sách và căn chỉnh
                  văn bản.
                </p>
              </div>
            }
            type="info"
            showIcon
            className="mb-6"
          />

          <Form form={form} layout="vertical">
            <Collapse defaultActiveKey={[]} className="mb-6" accordion={false}>
              {stipulations.map((stipulation, index) => (
                <Panel
                  header={
                    <div className="flex items-center justify-between pr-4">
                      <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-blue-500" />
                        <Text strong>
                          {stipulation.key || `Điều khoản #${index + 1}`}
                        </Text>
                        {stipulation.value && (
                          <Text type="secondary" className="text-xs">
                            ({stipulation.value.substring(0, 50)}
                            {stipulation.value.length > 50 ? "..." : ""})
                          </Text>
                        )}
                      </div>
                    </div>
                  }
                  key={index.toString()}
                  extra={
                    stipulations.length > 1 && (
                      <Popconfirm
                        title="Xóa điều khoản"
                        description="Bạn có chắc chắn muốn xóa điều khoản này?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleRemoveStipulation(index);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    )
                  }
                >
                  <Space direction="vertical" className="w-full">
                    <Form.Item label="Tên điều khoản" required className="mb-2">
                      <Input
                        placeholder="Ví dụ: dieukhoan1, dieukhoan2, ..."
                        value={stipulation.key}
                        onChange={(e) =>
                          handleStipulationChange(index, "key", e.target.value)
                        }
                        disabled={saving}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Nội dung điều khoản"
                      required
                      className="mb-0"
                    >
                      {/* Text formatting toolbar */}
                      <div className="mb-2 flex gap-1 flex-wrap border border-gray-200 p-2 rounded bg-gray-50">
                        <Button.Group size="small">
                          <Button
                            icon={<BoldOutlined />}
                            title="In đậm"
                            onClick={() => applyFormat(index, "bold")}
                          />
                          <Button
                            icon={<ItalicOutlined />}
                            title="In nghiêng"
                            onClick={() => applyFormat(index, "italic")}
                          />
                          <Button
                            icon={<UnderlineOutlined />}
                            title="Gạch chân"
                            onClick={() => applyFormat(index, "underline")}
                          />
                        </Button.Group>

                        <Divider type="vertical" className="h-6" />

                        <Button.Group size="small">
                          <Button
                            icon={<UnorderedListOutlined />}
                            title="Danh sách"
                            onClick={() =>
                              applyFormat(index, "insertUnorderedList")
                            }
                          />
                          <Button
                            icon={<OrderedListOutlined />}
                            title="Danh sách số"
                            onClick={() =>
                              applyFormat(index, "insertOrderedList")
                            }
                          />
                        </Button.Group>

                        <Divider type="vertical" className="h-6" />

                        <Button.Group size="small">
                          <Button
                            icon={<AlignLeftOutlined />}
                            title="Căn trái"
                            onClick={() => applyFormat(index, "justifyLeft")}
                          />
                          <Button
                            icon={<AlignCenterOutlined />}
                            title="Căn giữa"
                            onClick={() => applyFormat(index, "justifyCenter")}
                          />
                          <Button
                            icon={<AlignRightOutlined />}
                            title="Căn phải"
                            onClick={() => applyFormat(index, "justifyRight")}
                          />
                        </Button.Group>
                      </div>

                      <div
                        ref={(el) => {
                          editorRefs.current[index] = el;
                        }}
                        contentEditable={!saving}
                        dangerouslySetInnerHTML={{ __html: stipulation.value }}
                        onInput={(e) =>
                          handleEditorInput(index, e.currentTarget.innerHTML)
                        }
                        className="min-h-[150px] p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                        style={{
                          lineHeight: "1.6",
                          fontSize: "14px",
                        }}
                      />
                      <Text type="secondary" className="text-xs mt-1 block">
                        Sử dụng toolbar để định dạng văn bản: In đậm, In
                        nghiêng, Gạch chân, Danh sách, Căn chỉnh
                      </Text>
                    </Form.Item>
                  </Space>
                </Panel>
              ))}
            </Collapse>

            <Divider />

            <Button
              type="dashed"
              onClick={handleAddStipulation}
              block
              icon={<PlusOutlined />}
              disabled={saving}
              className="hover:border-blue-500 hover:text-blue-500"
            >
              Thêm điều khoản mới
            </Button>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default ContractStipulation;
