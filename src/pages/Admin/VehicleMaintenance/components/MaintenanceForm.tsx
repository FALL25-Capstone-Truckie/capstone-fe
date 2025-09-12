import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Select } from 'antd';
import type { VehicleMaintenance, Vehicle } from '../../../../models';
import dayjs from 'dayjs';

interface MaintenanceFormProps {
    initialValues?: VehicleMaintenance | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    vehicles: Vehicle[];
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    vehicles
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await onSubmit(values);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={
                initialValues
                    ? {
                        ...initialValues,
                        maintenanceDate: initialValues.maintenanceDate ? dayjs(initialValues.maintenanceDate) : undefined,
                        nextMaintenanceDate: initialValues.nextMaintenanceDate ? dayjs(initialValues.nextMaintenanceDate) : undefined
                    }
                    : {
                        maintenanceDate: dayjs(),
                        cost: 0
                    }
            }
        >
            <Form.Item
                name="vehicleId"
                label="Phương tiện"
                rules={[{ required: true, message: 'Vui lòng chọn phương tiện' }]}
            >
                <Select placeholder="Chọn phương tiện">
                    {vehicles.map(vehicle => (
                        <Select.Option key={vehicle.id} value={vehicle.id}>
                            {vehicle.licensePlateNumber} - {vehicle.model}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="maintenanceDate"
                label="Ngày bảo trì"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bảo trì' }]}
            >
                <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày bảo trì"
                />
            </Form.Item>

            <Form.Item
                name="description"
                label="Mô tả công việc bảo trì"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc bảo trì' }]}
            >
                <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết về công việc bảo trì" />
            </Form.Item>

            <Form.Item
                name="serviceCenter"
                label="Trung tâm dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập tên trung tâm dịch vụ' }]}
            >
                <Input placeholder="Nhập tên trung tâm dịch vụ" />
            </Form.Item>

            <Form.Item
                name="cost"
                label="Chi phí (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí' }]}
            >
                <InputNumber
                    className="w-full"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    placeholder="Nhập chi phí"
                    min={0}
                    addonAfter="VND"
                />
            </Form.Item>

            <Form.Item
                name="odometerReading"
                label="Số công-tơ-mét (km)"
            >
                <InputNumber
                    className="w-full"
                    placeholder="Nhập số công-tơ-mét hiện tại"
                    min={0}
                    addonAfter="km"
                />
            </Form.Item>

            <Form.Item
                name="nextMaintenanceDate"
                label="Ngày bảo trì tiếp theo (dự kiến)"
            >
                <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày bảo trì tiếp theo"
                    disabledDate={current => current && current < dayjs().endOf('day')}
                />
            </Form.Item>

            <Form.Item
                name="maintenanceTypeId"
                label="Loại bảo trì"
                rules={[{ required: true, message: 'Vui lòng chọn loại bảo trì' }]}
            >
                <Select placeholder="Chọn loại bảo trì">
                    <Select.Option value="1">Bảo trì định kỳ</Select.Option>
                    <Select.Option value="2">Sửa chữa</Select.Option>
                    <Select.Option value="3">Thay thế phụ tùng</Select.Option>
                    <Select.Option value="4">Kiểm tra kỹ thuật</Select.Option>
                </Select>
            </Form.Item>

            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={onCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {initialValues ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            </div>
        </Form>
    );
};

export default MaintenanceForm; 