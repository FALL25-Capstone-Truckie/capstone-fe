import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, Space, Table, Popconfirm, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { DistanceRule } from '../../../models';

interface DistanceRangeManagerProps {
  distanceRules: DistanceRule[];
  onAdd: (fromKm: number, toKm: number) => Promise<void>;
  onUpdate: (id: string, fromKm: number, toKm: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

interface DistanceRangeFormValues {
  fromKm: number;
  toKm: number;
}

const DistanceRangeManager: React.FC<DistanceRangeManagerProps> = ({
  distanceRules,
  onAdd,
  onUpdate,
  onDelete,
  loading = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<DistanceRule | null>(null);
  const [form] = Form.useForm<DistanceRangeFormValues>();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRule) {
        await onUpdate(editingRule.id, values.fromKm, values.toKm);
        message.success('Cập nhật khoảng cách thành công');
      } else {
        await onAdd(values.fromKm, values.toKm);
        message.success('Thêm khoảng cách thành công');
      }
      
      setIsModalVisible(false);
      setEditingRule(null);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (rule: DistanceRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      fromKm: rule.fromKm,
      toKm: rule.toKm
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      message.success('Xóa khoảng cách thành công');
    } catch (error: any) {
      message.error(error?.message || 'Không thể xóa khoảng cách');
    }
  };

  const columns = [
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center' as const,
      render: (order: number) => <Tag color="blue">{order + 1}</Tag>
    },
    {
      title: 'Khoảng cách',
      key: 'range',
      render: (_: any, record: DistanceRule) => (
        <Space>
          <Text strong>{record.displayName}</Text>
          {record.isBasePrice && (
            <Tag color="gold">Giá gốc</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Từ (km)',
      dataIndex: 'fromKm',
      key: 'fromKm',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString('vi-VN', { minimumFractionDigits: 2 })
    },
    {
      title: 'Đến (km)',
      dataIndex: 'toKm',
      key: 'toKm',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString('vi-VN', { minimumFractionDigits: 2 })
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: DistanceRule) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khoảng cách này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#666' }}>
              Hệ thống tự động tính toán tên hiển thị và thứ tự. Bạn chỉ cần nhập khoảng cách.
            </span>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm khoảng cách
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={distanceRules.filter(r => r.status === 'ACTIVE')}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Space>

      <Modal
        title={editingRule ? 'Chỉnh sửa khoảng cách' : 'Thêm khoảng cách mới'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRule ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Khoảng cách từ (km)"
            name="fromKm"
            rules={[
              { required: true, message: 'Vui lòng nhập khoảng cách từ' },
              { type: 'number', min: 0, message: 'Khoảng cách phải >= 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ví dụ: 0"
              min={0}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            label="Khoảng cách đến (km)"
            name="toKm"
            rules={[
              { required: true, message: 'Vui lòng nhập khoảng cách đến' },
              { type: 'number', min: 0.01, message: 'Khoảng cách phải > 0' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const fromKm = getFieldValue('fromKm');
                  if (value && fromKm && value <= fromKm) {
                    return Promise.reject(new Error('Khoảng cách đến phải lớn hơn khoảng cách từ'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ví dụ: 3.99"
              min={0.01}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <div style={{ 
            backgroundColor: '#f0f5ff', 
            padding: '12px', 
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <Space direction="vertical" size="small">
              <Text strong style={{ color: '#1890ff' }}>
                <InfoCircleOutlined /> Gợi ý:
              </Text>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                • Khoảng cách từ 0 sẽ được đặt làm giá gốc
              </Text>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                • Tên hiển thị sẽ được tự động tạo (ví dụ: "4KM ĐẦU", "5-15KM")
              </Text>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                • Hệ thống sẽ kiểm tra trùng lặp khoảng cách
              </Text>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const Text = ({ children, ...props }: any) => <span {...props}>{children}</span>;

export default DistanceRangeManager;
