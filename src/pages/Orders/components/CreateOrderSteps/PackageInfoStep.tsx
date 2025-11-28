import React from "react";
import { Form, InputNumber, Select, Input, Typography, Row, Col, Radio, Tag, Alert, Space, Switch, Divider } from "antd";
import type { OrderSize } from "../../../../models/OrderSize";
import type { Category } from "../../../../models/Category";
import { CategoryName, getCategoryDisplayName, isFragileCategory } from "../../../../models/CategoryName";
import { formatCurrency } from "../../../../utils/formatters";

const { Title, Text } = Typography;
const { Option } = Select;

interface PackageInfoStepProps {
  orderSizes: OrderSize[];
  weightUnits: { value: string; label: string }[];
  categories: Category[];
}

const PackageInfoStep: React.FC<PackageInfoStepProps> = ({
  orderSizes,
  weightUnits,
  categories,
}) => {
  // const weightUnits = [
  //   { value: "Tấn", label: "Tấn" },
  //   { value: "Tạ", label: "Tạ" },
  //   { value: "Yến", label: "Yến" },
  //   { value: "Kí", label: "Kilogram (kg)" },
  // ];

  return (
    <>
      <Title level={4}>Thông tin kích thước và trọng lượng</Title>

      {/* Category Selection */}
      <Alert
        message="Lưu ý quan trọng về loại hàng"
        description={
          <Text type="secondary">
            1 đơn hàng chỉ có thể thuộc 1 loại hàng, không mix các loại hàng vào 1 đơn.
            Vui lòng chọn loại hàng phù hợp cho toàn bộ kiện hàng của bạn.
          </Text>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="categoryId"
        label="Loại hàng hóa"
        rules={[{ required: true, message: "Vui lòng chọn loại hàng hóa" }]}
      >
        <Radio.Group>
          <Row gutter={[16, 8]}>
            {categories.map((category) => (
              <Col key={category.id} xs={24} sm={12} md={8}>
                <Radio value={category.id}>
                  <Space>
                    <Text>{getCategoryDisplayName(category.categoryName)}</Text>
                    {/* {isFragileCategory(category.categoryName) && (
                      <Tag color="orange">
                        Dễ vỡ
                      </Tag>
                    )} */}
                  </Space>
                </Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Weight and Unit Selection */}
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="weight"
            label="Trọng lượng"
            rules={[
              { required: true, message: "Vui lòng nhập trọng lượng" },
              {
                type: "number",
                min: 0.1,
                message: "Trọng lượng phải lớn hơn 0",
              },
            ]}
          >
            <InputNumber
              min={0.1}
              step={0.1}
              precision={2}
              style={{ width: "100%" }}
              placeholder="Nhập trọng lượng"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="weightUnit"
            label="Đơn vị"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
            initialValue="Kí"
          >
            <Select placeholder="Chọn đơn vị">
              {weightUnits.map((unit) => (
                <Option key={unit.value} value={unit.value}>
                  {unit.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="orderSizeId"
        label="Kích thước"
        rules={[{ required: true, message: "Vui lòng chọn kích thước" }]}
      >
        <Select placeholder="Chọn kích thước kiện hàng">
          {orderSizes.map((size) => (
            <Option key={size.id} value={size.id}>
              {size.minWidth} - {size.maxWidth} x {size.minLength} -{" "}
              {size.maxLength} x {size.minHeight} - {size.maxHeight} /{" "}
              {formatCurrency(size.price || 0)}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả kích thước"
        rules={[{ required: true, message: "Vui lòng nhập mô tả kích thước" }]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Mô tả chi tiết về kích thước kiện hàng"
        />
      </Form.Item>

      <Divider />

      {/* Insurance Selection */}
      <Title level={4}>Bảo hiểm hàng hóa</Title>
      
      <Alert
        message="Lưu ý về bảo hiểm"
        description={
          <div>
            <Text type="secondary">
              • Bảo hiểm là tùy chọn nhưng được khuyến nghị cho hàng hóa giá trị cao<br/>
              • Khi có bảo hiểm: Bồi thường tối đa bằng giá trị khai báo nếu có đầy đủ chứng từ<br/>
              • Khi không có bảo hiểm: Bồi thường tối đa 10 lần cước phí vận chuyển<br/>
              • Phải có hóa đơn VAT hoặc chứng từ mua bán hợp lệ khi yêu cầu bồi thường
            </Text>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="hasInsurance"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Có bảo hiểm" 
          unCheckedChildren="Không bảo hiểm"
        />
      </Form.Item>
    </>
  );
};

export default PackageInfoStep;
