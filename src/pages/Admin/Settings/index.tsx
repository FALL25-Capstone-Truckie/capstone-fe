import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  App,
  Spin,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  BankOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminSettingsService from '../../../services/admin/adminSettingsService';
import CarrierLocationMap from '../../../components/common/CarrierLocationMap';
import type {
  ContractSettingResponse,
  CarrierSettingResponse,
  ContractSettingRequest,
  CarrierSettingRequest,
  UpdateContractSettingRequest,
} from '../../../services/admin/adminSettingsService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminSettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [contractForm] = Form.useForm();
  const [carrierForm] = Form.useForm();

  // Fetch Contract Settings
  const {
    data: contractSettings,
    isLoading: contractLoading,
    refetch: refetchContract,
  } = useQuery({
    queryKey: ['contractSettings'],
    queryFn: adminSettingsService.contractSettings.getAll,
  });

  // Fetch Carrier Settings
  const {
    data: carrierSettings,
    isLoading: carrierLoading,
    refetch: refetchCarrier,
  } = useQuery({
    queryKey: ['carrierSettings'],
    queryFn: adminSettingsService.carrierSettings.getAll,
  });


  // Contract Settings Mutations
  const contractCreateMutation = useMutation({
    mutationFn: adminSettingsService.contractSettings.create,
    onSuccess: () => {
      message.success('Tạo cài đặt hợp đồng thành công');
      refetchContract();
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi tạo cài đặt hợp đồng');
    },
  });

  const contractUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractSettingRequest }) =>
      adminSettingsService.contractSettings.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật cài đặt hợp đồng thành công');
      refetchContract();
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật cài đặt hợp đồng');
    },
  });

  // Carrier Settings Mutations
  const carrierCreateMutation = useMutation({
    mutationFn: adminSettingsService.carrierSettings.create,
    onSuccess: () => {
      message.success('Tạo thông tin công ty thành công');
      refetchCarrier();
      carrierForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi tạo thông tin công ty');
    },
  });

  const carrierUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarrierSettingRequest }) =>
      adminSettingsService.carrierSettings.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật thông tin công ty thành công');
      refetchCarrier();
      carrierForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin công ty');
    },
  });



  // Initialize forms with data
  useEffect(() => {
    if (contractSettings && contractSettings.length > 0) {
      contractForm.setFieldsValue(contractSettings[0]);
    }
    if (carrierSettings && carrierSettings.length > 0) {
      carrierForm.setFieldsValue(carrierSettings[0]);
    }
  }, [contractSettings, carrierSettings, contractForm, carrierForm]);


  // Handle form submissions
  const handleContractSubmit = (values: ContractSettingRequest) => {
    if (contractSettings && contractSettings.length > 0) {
      contractUpdateMutation.mutate({ id: contractSettings[0].id, data: values });
    } else {
      contractCreateMutation.mutate(values);
    }
  };

  const handleCarrierSubmit = (values: CarrierSettingRequest) => {
    if (carrierSettings && carrierSettings.length > 0) {
      carrierUpdateMutation.mutate({ id: carrierSettings[0].id, data: values });
    } else {
      carrierCreateMutation.mutate(values);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (latitude: number, longitude: number, address?: string) => {
    carrierForm.setFieldsValue({
      carrierLatitude: latitude,
      carrierLongitude: longitude,
      carrierAddressLine: address || carrierForm.getFieldValue('carrierAddressLine')
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2 text-blue-600">
          <SettingOutlined />
          Cài đặt hệ thống
        </Title>
        <Text type="secondary">
          Quản lý các cài đặt hệ thống và thông tin công ty
        </Text>
      </div>

      <Tabs defaultActiveKey="contract" type="card">
        {/* Contract Settings Tab */}
        <TabPane
          tab={
            <span>
              <ContainerOutlined />
              Cài đặt hợp đồng
            </span>
          }
          key="contract"
        >
          <Card>
            <Spin spinning={contractLoading}>
              <Form
                form={contractForm}
                layout="vertical"
                onFinish={handleContractSubmit}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Phần trăm đặt cọc"
                      name="depositPercent"
                      rules={[
                        { required: true, message: 'Vui lòng nhập phần trăm đặt cọc' },
                        { type: 'number', min: 0, max: 100, message: 'Giá trị phải từ 0 đến 100' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập phần trăm đặt cọc"
                        min={0}
                        max={100}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Hạn thanh toán cọc (giờ)"
                      name="depositDeadlineHours"
                      rules={[
                        { required: true, message: 'Vui lòng nhập hạn thanh toán cọc (giờ)' },
                        { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập số giờ"
                        min={1}
                        addonAfter="giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Hạn ký hợp đồng (giờ)"
                      name="signingDeadlineHours"
                      rules={[
                        { required: true, message: 'Vui lòng nhập hạn ký hợp đồng' },
                        { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập số giờ"
                        min={1}
                        addonAfter="giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Số ngày thanh toán toàn bộ trước khi lấy hàng"
                      name="fullPaymentDaysBeforePickup"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số ngày thanh toán toàn bộ' },
                        { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập số ngày"
                        min={0}
                        addonAfter="ngày"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tỷ lệ bảo hiểm hàng thường (%)"
                      name="insuranceRateNormal"
                      rules={[
                        { required: true, message: 'Vui lòng nhập tỷ lệ bảo hiểm' },
                        { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ví dụ: 0.08"
                        min={0}
                        step={0.01}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tỷ lệ bảo hiểm hàng dễ vỡ (%)"
                      name="insuranceRateFragile"
                      rules={[
                        { required: true, message: 'Vui lòng nhập tỷ lệ bảo hiểm' },
                        { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ví dụ: 0.15"
                        min={0}
                        step={0.01}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tỷ lệ VAT (%)"
                      name="vatRate"
                      rules={[
                        { required: true, message: 'Vui lòng nhập tỷ lệ VAT' },
                        { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ví dụ: 10"
                        min={0}
                        step={0.1}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={contractCreateMutation.isPending || contractUpdateMutation.isPending}
                  >
                    Lưu cài đặt
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </TabPane>

        {/* Carrier Settings Tab */}
        <TabPane
          tab={
            <span>
              <BankOutlined />
              Thông tin công ty
            </span>
          }
          key="carrier"
        >
          <Card>
            <Spin spinning={carrierLoading}>
              <Form
                form={carrierForm}
                layout="vertical"
                onFinish={handleCarrierSubmit}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tên công ty"
                      name="carrierName"
                      rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                    >
                      <Input placeholder="Nhập tên công ty" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tên người đại diện"
                      name="representativeName"
                      rules={[{ required: true, message: 'Vui lòng nhập tên người đại diện' }]}
                    >
                      <Input placeholder="Nhập tên người đại diện" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ"
                      name="carrierAddressLine"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                      <Input placeholder="Nhập địa chỉ công ty" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Email"
                      name="carrierEmail"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Số điện thoại"
                      name="carrierPhone"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Mã số thuế"
                      name="carrierTaxCode"
                      rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}
                    >
                      <Input placeholder="Nhập mã số thuế" />
                    </Form.Item>
                  </Col>
                </Row>
                
                {/* Hidden fields for coordinates - updated by map */}
                <Form.Item name="carrierLatitude" hidden>
                  <InputNumber />
                </Form.Item>
                <Form.Item name="carrierLongitude" hidden>
                  <InputNumber />
                </Form.Item>
                
                {/* Inline Map Component */}
                <CarrierLocationMap
                  initialLatitude={carrierForm.getFieldValue('carrierLatitude')}
                  initialLongitude={carrierForm.getFieldValue('carrierLongitude')}
                  onLocationChange={handleLocationSelect}
                />
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={carrierCreateMutation.isPending || carrierUpdateMutation.isPending}
                  >
                    Lưu cài đặt
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </TabPane>


      </Tabs>

    </div>
  );
};

export default AdminSettingsPage;
