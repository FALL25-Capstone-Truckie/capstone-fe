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
  Select,
  Modal,
  Tabs,
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
  CopyOutlined,
  AppstoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import contractSettingService from "@/services/contract/contractSettingService";
import type { StipulationSettings } from "@/models/Contract";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;

interface StipulationItem {
  key: string;
  value: string;
}

interface StipulationTemplate {
  id: string;
  name: string;
  key: string;
  value: string;
  category: string;
  description: string;
}

const STIPULATION_TEMPLATES: StipulationTemplate[] = [
  {
    id: "1",
    name: "Điều khoản hàng hóa vận chuyển",
    key: "Điều khoản hàng hóa vận chuyển",
    category: "Cơ bản",
    description: "Quy định về loại hàng hóa, khối lượng và đơn vị tính",
    value: `<p><strong>Điều khoản hàng hóa vận chuyển:</strong></p>
<p>Bên A thuê Bên B vận chuyển hàng hóa với các thông tin:</p>
<ul>
<li>Loại hàng: [Sẽ được điền tự động từ thông tin đơn hàng]</li>
<li>Khối lượng: [Sẽ được điền tự động]</li>
<li>Đơn vị tính: Tấn/Kg</li>
</ul>`,
  },
  {
    id: "2",
    name: "Địa điểm giao nhận hàng",
    key: "Địa điểm giao nhận hàng",
    category: "Cơ bản",
    description: "Quy định địa điểm nhận và giao hàng",
    value: `<p><strong>Địa điểm giao nhận:</strong></p>
<p>2.1. Bên B đưa phương tiện đến nhận hàng tại địa điểm do Bên A chỉ định.</p>
<p>2.2. Bên B giao hàng cho Bên A tại địa điểm đã thỏa thuận trong đơn hàng.</p>`,
  },
  {
    id: "3",
    name: "Phương thức giao nhận",
    key: "Phương thức giao nhận",
    category: "Cơ bản",
    description: "Quy định cách thức giao nhận hàng hóa",
    value: `<p><strong>Phương thức giao nhận:</strong></p>
<p>Hai bên thỏa thuận giao nhận hàng theo phương thức:</p>
<ul>
<li>Theo trọng lượng và khối lượng thực tế</li>
<li>Kiểm tra chất lượng hàng hóa khi giao nhận</li>
<li>Ký xác nhận biên bản giao nhận đầy đủ</li>
</ul>`,
  },
  {
    id: "4",
    name: "Phương tiện vận tải",
    key: "Phương tiện vận tải",
    category: "Phương tiện",
    description: "Quy định về phương tiện và tiêu chuẩn kỹ thuật",
    value: `<p><strong>Phương tiện vận tải:</strong></p>
<p>4.1. Bên B cung cấp phương tiện vận tải phù hợp với loại hàng hóa đã thỏa thuận.</p>
<p>4.2. Phương tiện phải đạt các tiêu chuẩn:</p>
<ul>
<li>Có giấy tờ pháp lý đầy đủ, hợp lệ</li>
<li>Tình trạng kỹ thuật tốt, đảm bảo an toàn</li>
<li>Phù hợp với loại hàng hóa vận chuyển</li>
</ul>
<p>4.3. Bên B chịu trách nhiệm về mọi chi phí liên quan đến phương tiện vận tải (nhiên liệu, bảo dưỡng, sửa chữa).</p>`,
  },
  {
    id: "5",
    name: "Thời gian thực hiện",
    key: "Thời gian thực hiện",
    category: "Thời gian",
    description: "Quy định về thời gian nhận, giao và xử phạt chậm trễ",
    value: `<p><strong>Thời gian thực hiện:</strong></p>
<p>5.1. Thời gian nhận hàng: [Tự động từ pickup_date]</p>
<p>5.2. Thời gian giao hàng dự kiến: [Tự động từ delivery_date]</p>
<p>5.3. Nếu chậm trễ do lỗi của Bên B, phạt 0.5% giá trị hợp đồng/ngày chậm, tối đa 10% tổng giá trị.</p>
<p>5.4. Trường hợp bất khả kháng (thiên tai, dịch bệnh, chiến tranh), hai bên sẽ thỏa thuận lại thời gian thực hiện.</p>`,
  },
  {
    id: "6",
    name: "Chi phí và cước phí",
    key: "Chi phí và cước phí",
    category: "Chi phí",
    description: "Quy định về cách tính cước phí và các khoản phụ phí",
    value: `<p><strong>Chi phí và cước phí:</strong></p>
<p>6.1. Cước phí vận chuyển:</p>
<ul>
<li>Cước chính: [Tự động tính từ base_price + distance_price]</li>
<li>Phụ phí (nếu có): [Tự động từ surcharges]</li>
</ul>
<p>6.2. Phương thức thanh toán:</p>
<ul>
<li>Thanh toán trước: [deposit_amount] VNĐ</li>
<li>Thanh toán sau khi hoàn thành: [remaining_amount] VNĐ</li>
</ul>
<p>6.3. Hình thức thanh toán: Chuyển khoản ngân hàng hoặc tiền mặt</p>`,
  },
  {
    id: "7",
    name: "Thanh toán",
    key: "Thanh toán",
    category: "Chi phí",
    description: "Quy định về thời hạn và hình thức thanh toán",
    value: `<p><strong>Thanh toán:</strong></p>
<p>7.1. Bên A thanh toán đặt cọc trước khi bắt đầu vận chuyển.</p>
<p>7.2. Thanh toán phần còn lại trong vòng 24 giờ sau khi nhận hàng thành công.</p>
<p>7.3. Nếu chậm thanh toán, Bên A phải chịu lãi suất 0.05%/ngày trên số tiền chậm trả.</p>`,
  },
  {
    id: "8",
    name: "Trách nhiệm Bên A",
    key: "Trách nhiệm Bên A (Khách hàng)",
    category: "Trách nhiệm",
    description: "Quyền và nghĩa vụ của Bên A",
    value: `<p><strong>Trách nhiệm Bên A:</strong></p>
<p>8.1. Bên A có trách nhiệm:</p>
<ul>
<li>Cung cấp thông tin chính xác về hàng hóa (khối lượng, kích thước, tính chất)</li>
<li>Đóng gói hàng hóa đảm bảo an toàn cho việc vận chuyển</li>
<li>Có mặt đúng giờ tại địa điểm giao/nhận hàng</li>
<li>Thanh toán đầy đủ, đúng hạn theo thỏa thuận</li>
</ul>
<p>8.2. Bên A có quyền:</p>
<ul>
<li>Yêu cầu Bên B vận chuyển đúng thời gian, địa điểm</li>
<li>Kiểm tra tình trạng hàng hóa khi nhận</li>
<li>Yêu cầu bồi thường nếu Bên B làm hư hỏng, mất mát hàng hóa</li>
</ul>`,
  },
  {
    id: "9",
    name: "Trách nhiệm Bên B",
    key: "Trách nhiệm Bên B (Nhà cung cấp)",
    category: "Trách nhiệm",
    description: "Quyền và nghĩa vụ của Bên B",
    value: `<p><strong>Trách nhiệm Bên B:</strong></p>
<p>9.1. Bên B có trách nhiệm:</p>
<ul>
<li>Vận chuyển hàng hóa an toàn, đầy đủ đến đúng địa điểm</li>
<li>Bảo quản hàng hóa trong quá trình vận chuyển</li>
<li>Giao hàng đúng thời gian đã cam kết</li>
<li>Mua bảo hiểm trách nhiệm dân sự theo quy định</li>
</ul>
<p>9.2. Bên B có quyền:</p>
<ul>
<li>Từ chối vận chuyển nếu hàng hóa không đúng mô tả</li>
<li>Yêu cầu Bên A thanh toán đủ, đúng hạn</li>
<li>Được bồi thường nếu Bên A cung cấp thông tin sai lệch gây thiệt hại</li>
</ul>`,
  },
  {
    id: "10",
    name: "Bồi thường thiệt hại",
    key: "Bồi thường thiệt hại",
    category: "Trách nhiệm",
    description: "Quy định về bồi thường khi có thiệt hại",
    value: `<p><strong>Bồi thường thiệt hại:</strong></p>
<p>10.1. Nếu hàng hóa bị mất mát, hư hỏng do lỗi của Bên B:</p>
<ul>
<li>Bồi thường 100% giá trị hàng hóa nếu mất hoàn toàn</li>
<li>Bồi thường theo tỷ lệ hư hỏng nếu hư hỏng một phần</li>
</ul>
<p>10.2. Hao hụt tự nhiên trong giới hạn cho phép (dưới 0.5% khối lượng) không phải bồi thường.</p>
<p>10.3. Trường hợp bất khả kháng, hai bên không phải bồi thường cho nhau.</p>`,
  },
  {
    id: "11",
    name: "Bảo hiểm",
    key: "Bảo hiểm",
    category: "Bảo hiểm",
    description: "Quy định về việc mua bảo hiểm",
    value: `<p><strong>Bảo hiểm:</strong></p>
<p>11.1. Bên A mua bảo hiểm hàng hóa (nếu cần thiết).</p>
<p>11.2. Bên B mua bảo hiểm trách nhiệm dân sự cho phương tiện và lái xe.</p>
<p>11.3. Chi phí bảo hiểm do mỗi bên tự chịu.</p>`,
  },
  {
    id: "12",
    name: "Giải quyết tranh chấp",
    key: "Giải quyết tranh chấp",
    category: "Tranh chấp",
    description: "Quy định về cách giải quyết tranh chấp",
    value: `<p><strong>Giải quyết tranh chấp:</strong></p>
<p>12.1. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải.</p>
<p>12.2. Nếu không thỏa thuận được, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền để giải quyết theo pháp luật Việt Nam.</p>
<p>12.3. Trong quá trình giải quyết tranh chấp, các bên vẫn phải thực hiện các nghĩa vụ không có tranh chấp.</p>`,
  },
  {
    id: "13",
    name: "Sửa đổi, bổ sung",
    key: "Sửa đổi, bổ sung hợp đồng",
    category: "Hợp đồng",
    description: "Quy định về việc sửa đổi hợp đồng",
    value: `<p><strong>Sửa đổi, bổ sung:</strong></p>
<p>13.1. Mọi sửa đổi, bổ sung hợp đồng phải được hai bên thỏa thuận bằng văn bản.</p>
<p>13.2. Phụ lục hợp đồng (nếu có) là bộ phận không tách rời của hợp đồng này.</p>
<p>13.3. Trong quá trình thực hiện, nếu có quy định mới của pháp luật trái với nội dung hợp đồng, hai bên sẽ thỏa thuận điều chỉnh cho phù hợp.</p>`,
  },
  {
    id: "14",
    name: "Chấm dứt hợp đồng",
    key: "Chấm dứt hợp đồng",
    category: "Hợp đồng",
    description: "Quy định về điều kiện chấm dứt hợp đồng",
    value: `<p><strong>Chấm dứt hợp đồng:</strong></p>
<p>14.1. Hợp đồng chấm dứt khi:</p>
<ul>
<li>Hai bên đã hoàn thành đầy đủ nghĩa vụ</li>
<li>Hai bên thỏa thuận chấm dứt bằng văn bản</li>
<li>Theo quyết định của Tòa án</li>
</ul>
<p>14.2. Khi chấm dứt hợp đồng, các bên phải thanh lý các nghĩa vụ còn tồn đọng.</p>
<p>14.3. Một bên đơn phương chấm dứt hợp đồng phải báo trước 7 ngày và phải bồi thường thiệt hại cho bên kia.</p>`,
  },
];

const ContractStipulation: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stipulations, setStipulations] = useState<StipulationItem[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  const handleAddFromTemplate = (template: StipulationTemplate) => {
    setStipulations([
      ...stipulations,
      { key: template.key, value: template.value },
    ]);
    setIsTemplateModalOpen(false);
    message.success(`Đã thêm điều khoản "${template.name}"`);
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
              icon={<AppstoreOutlined />}
              onClick={() => setIsTemplateModalOpen(true)}
              disabled={loading || saving}
            >
              Thư viện mẫu
            </Button>
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

            <Space className="w-full" direction="vertical" size="middle">
              <Button
                type="dashed"
                onClick={() => setIsTemplateModalOpen(true)}
                block
                icon={<AppstoreOutlined />}
                disabled={saving}
                className="hover:border-green-500 hover:text-green-500"
                size="large"
              >
                Chọn từ thư viện mẫu
              </Button>

              <Button
                type="dashed"
                onClick={handleAddStipulation}
                block
                icon={<PlusOutlined />}
                disabled={saving}
                className="hover:border-blue-500 hover:text-blue-500"
              >
                Tạo điều khoản mới (tùy chỉnh)
              </Button>
            </Space>
          </Form>
        </Spin>
      </Card>

      {/* Template Library Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-blue-500" />
            <span>Thư viện điều khoản mẫu</span>
          </div>
        }
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={900}
      >
        <div className="mb-4">
          <Text type="secondary">
            Chọn các điều khoản có sẵn từ thư viện pháp luật. Bạn có thể chỉnh
            sửa sau khi thêm.
          </Text>
        </div>

        <Tabs
          defaultActiveKey="all"
          onChange={setSelectedCategory}
          items={[
            { key: "all", label: "Tất cả" },
            { key: "Cơ bản", label: "Cơ bản" },
            { key: "Phương tiện", label: "Phương tiện" },
            { key: "Thời gian", label: "Thời gian" },
            { key: "Chi phí", label: "Chi phí" },
            { key: "Trách nhiệm", label: "Trách nhiệm" },
            { key: "Bảo hiểm", label: "Bảo hiểm" },
            { key: "Tranh chấp", label: "Tranh chấp" },
            { key: "Hợp đồng", label: "Hợp đồng" },
          ]}
        />

        <div className="max-h-[500px] overflow-y-auto">
          <Space direction="vertical" className="w-full" size="middle">
            {STIPULATION_TEMPLATES.filter(
              (t) =>
                selectedCategory === "all" || t.category === selectedCategory
            ).map((template) => (
              <Card
                key={template.id}
                size="small"
                hoverable
                className="cursor-pointer"
                onClick={() => handleAddFromTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileTextOutlined className="text-blue-500" />
                      <Text strong>{template.name}</Text>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                    <Text type="secondary" className="text-sm">
                      {template.description}
                    </Text>
                    <div
                      className="mt-2 p-2 bg-gray-50 rounded text-xs"
                      dangerouslySetInnerHTML={{
                        __html: template.value.substring(0, 200) + "...",
                      }}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFromTemplate(template);
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default ContractStipulation;
