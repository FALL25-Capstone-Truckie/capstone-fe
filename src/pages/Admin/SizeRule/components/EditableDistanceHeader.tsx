import React, { useState } from 'react';
import { 
    Button, 
    Modal, 
    InputNumber, 
    Form, 
    Space, 
    Popconfirm, 
    Tooltip,
    Typography,
    Divider,
    Alert
} from 'antd';
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined,
    WarningOutlined
} from '@ant-design/icons';
import type { DistanceRule } from '../../../../models';

const { Text } = Typography;

interface EditableDistanceHeaderProps {
    distanceRule: DistanceRule;
    allDistanceRules: DistanceRule[];
    onUpdate: (id: string, fromKm: number, toKm: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddBefore?: (fromKm: number, toKm: number) => Promise<void>;
    loading?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
}

interface AddDistanceRangeButtonProps {
    position: 'before' | 'after';
    adjacentRange: DistanceRule;
    allDistanceRules: DistanceRule[];
    onAdd: (fromKm: number, toKm: number) => Promise<void>;
    loading?: boolean;
}

// Format display name for distance range
const formatDistanceRange = (fromKm: number, toKm: number): string => {
    if (fromKm === 0) {
        const upper = Math.round(toKm + 0.01);
        return `${upper}KM ĐẦU`;
    }
    if (toKm >= 99999 || toKm > 9999) {
        return `>${fromKm}KM`;
    }
    const upper = Math.round(toKm + 0.01);
    return `${fromKm}KM - ${upper}KM`;
};

// Component for Add Distance Range Button (appears between columns)
export const AddDistanceRangeButton: React.FC<AddDistanceRangeButtonProps> = ({
    position,
    adjacentRange,
    allDistanceRules,
    onAdd,
    loading
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Calculate suggested range based on position
    const getSuggestedRange = () => {
        const sortedRules = [...allDistanceRules]
            .filter(r => r.status === 'ACTIVE')
            .sort((a, b) => a.fromKm - b.fromKm);
        
        const currentIndex = sortedRules.findIndex(r => r.id === adjacentRange.id);
        
        if (position === 'before') {
            // Add before this range
            if (currentIndex === 0) {
                // Can't add before first range
                return null;
            }
            const prevRange = sortedRules[currentIndex - 1];
            // Suggest splitting the gap or current range
            const midPoint = (prevRange.toKm + adjacentRange.fromKm) / 2;
            return {
                fromKm: prevRange.toKm,
                toKm: adjacentRange.fromKm
            };
        } else {
            // Add after this range
            if (currentIndex === sortedRules.length - 1) {
                // Last range - can add a new open-ended range
                return {
                    fromKm: adjacentRange.toKm,
                    toKm: 99999999
                };
            }
            const nextRange = sortedRules[currentIndex + 1];
            return {
                fromKm: adjacentRange.toKm,
                toKm: nextRange.fromKm
            };
        }
    };

    const handleOpen = () => {
        const suggested = getSuggestedRange();
        if (suggested) {
            form.setFieldsValue({
                fromKm: suggested.fromKm,
                toKm: suggested.toKm < 99999 ? suggested.toKm : undefined
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onAdd(values.fromKm, values.toKm || 99999999);
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            // Validation error
        }
    };

    return (
        <>
            <Tooltip title="Thêm khoảng cách mới">
                <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleOpen}
                    loading={loading}
                    style={{ 
                        opacity: 0.6,
                        padding: '0 4px',
                        height: '20px',
                        fontSize: '10px'
                    }}
                    className="hover:opacity-100"
                />
            </Tooltip>

            <Modal
                title="Thêm khoảng cách mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                confirmLoading={loading}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Alert
                    message="Hệ thống sẽ tự động điều chỉnh các khoảng cách liền kề để tránh trùng lặp"
                    type="info"
                    showIcon
                    className="mb-4"
                />
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="fromKm"
                        label="Từ (km)"
                        rules={[{ required: true, message: 'Vui lòng nhập khoảng cách bắt đầu' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="Ví dụ: 15"
                        />
                    </Form.Item>
                    <Form.Item
                        name="toKm"
                        label="Đến (km)"
                        rules={[{ required: true, message: 'Vui lòng nhập khoảng cách kết thúc' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="Ví dụ: 50 (hoặc 99999999 cho không giới hạn)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// Main Editable Distance Header Component
const EditableDistanceHeader: React.FC<EditableDistanceHeaderProps> = ({
    distanceRule,
    allDistanceRules,
    onUpdate,
    onDelete,
    loading,
    isFirst,
    isLast
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();

    const displayName = distanceRule.displayName || formatDistanceRange(distanceRule.fromKm, distanceRule.toKm);
    const isBasePrice = distanceRule.isBasePrice || distanceRule.fromKm === 0;

    const handleEditClick = () => {
        form.setFieldsValue({
            fromKm: distanceRule.fromKm,
            toKm: distanceRule.toKm < 99999 ? distanceRule.toKm : undefined
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onUpdate(
                distanceRule.id, 
                values.fromKm, 
                values.toKm || 99999999
            );
            setIsEditModalOpen(false);
        } catch (error) {
            // Validation error handled by form
        }
    };

    const handleDelete = async () => {
        await onDelete(distanceRule.id);
    };

    // Check if can delete (must have at least 2 active ranges)
    const activeRulesCount = allDistanceRules.filter(r => r.status === 'ACTIVE').length;
    const canDelete = activeRulesCount > 1 && !isBasePrice;

    return (
        <>
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                    <Text strong style={{ color: '#fff', fontSize: '12px' }}>
                        {displayName}
                    </Text>
                    <Tooltip title="Chỉnh sửa khoảng cách">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined style={{ color: '#fff', fontSize: '10px' }} />}
                            onClick={handleEditClick}
                            loading={loading}
                            style={{ 
                                padding: '0 2px',
                                height: '16px',
                                minWidth: '16px'
                            }}
                        />
                    </Tooltip>
                    {canDelete && (
                        <Popconfirm
                            title="Xóa khoảng cách này?"
                            description="Hệ thống sẽ tự động điều chỉnh các khoảng cách còn lại"
                            onConfirm={handleDelete}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Xóa khoảng cách">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined style={{ color: '#ff7875', fontSize: '10px' }} />}
                                    loading={loading}
                                    style={{ 
                                        padding: '0 2px',
                                        height: '16px',
                                        minWidth: '16px'
                                    }}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </div>
                {isBasePrice && (
                    <Text style={{ color: '#ffd666', fontSize: '9px' }}>Giá gốc</Text>
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                title={`Chỉnh sửa: ${displayName}`}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleEditSubmit}
                confirmLoading={loading}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Alert
                    message="Hệ thống sẽ tự động điều chỉnh các khoảng cách liền kề và tính toán lại tên hiển thị"
                    type="info"
                    showIcon
                    className="mb-4"
                />
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="fromKm"
                        label="Từ (km)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập khoảng cách bắt đầu' },
                            { type: 'number', min: 0, message: 'Giá trị phải >= 0' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            disabled={isBasePrice} // Base price always starts from 0
                        />
                    </Form.Item>
                    <Form.Item
                        name="toKm"
                        label="Đến (km)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập khoảng cách kết thúc' }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="99999999 = không giới hạn"
                        />
                    </Form.Item>
                </Form>

                {isBasePrice && (
                    <Alert
                        message="Đây là khoảng cách giá gốc"
                        description="Khoảng cách bắt đầu (từ 0km) không thể thay đổi điểm bắt đầu"
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                    />
                )}
            </Modal>
        </>
    );
};

export default EditableDistanceHeader;
