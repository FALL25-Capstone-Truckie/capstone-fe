import React from "react";
import { Form, Input, Select, Typography, Row, Col, DatePicker } from "antd";
import type { Category } from "../../../../models/Category";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

interface ReceiverInfoStepProps {
  categories: Category[];
}

const ReceiverInfoStep: React.FC<ReceiverInfoStepProps> = ({ categories }) => {
  return (
    <>
      <Title level={4}>Thông tin cơ bản</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="receiverName"
            label="Tên người nhận"
            rules={[
              { required: true, message: "Vui lòng nhập tên người nhận" },
            ]}
          >
            <Input placeholder="Nhập tên người nhận" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="receiverPhone"
            label="Số điện thoại người nhận"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại người nhận",
              },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải có 10 chữ số",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại người nhận" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="receiverIdentity"
            label="CCCD người nhận"
            rules={[
              { required: true, message: "Vui lòng nhập CCCD người nhận" },
              {
                pattern: /^[0-9]{12}$/,
                message: "CCCD phải có 12 chữ số",
              },
            ]}
          >
            <Input placeholder="Nhập số CCCD người nhận" maxLength={12} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="categoryId"
            label="Loại hàng hóa"
            rules={[{ required: true, message: "Vui lòng chọn loại hàng hóa" }]}
          >
            <Select placeholder="Chọn loại hàng hóa">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="estimateStartTime"
            label="Thời gian lấy hàng dự kiến"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian lấy hàng" },
            ]}
          >
            <DatePicker
              showTime
              placeholder="Chọn ngày và giờ lấy hàng"
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="packageDescription"
        label="Mô tả gói hàng"
        rules={[{ required: true, message: "Vui lòng nhập mô tả gói hàng" }]}
      >
        <Input.TextArea rows={4} placeholder="Mô tả chi tiết về gói hàng" />
      </Form.Item>
    </>
  );
};

export default ReceiverInfoStep;
