import React, { useState } from "react";
import { Form, Input, Button, Card, Empty, Divider, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined, SafetyOutlined, ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import type { Seal } from "../../../../models/VehicleAssignment";

interface SealAssignmentStepProps {
    onComplete: (seals: Seal[]) => void;
    onBack: () => void;
    initialSeals?: Seal[];
}

const SealAssignmentStep: React.FC<SealAssignmentStepProps> = ({
    onComplete,
    onBack,
    initialSeals = []
}) => {
    const [seals, setSeals] = useState<Seal[]>(
        initialSeals.length > 0 ? initialSeals : [{ sealCode: "", description: "" }]
    );

    const handleAddSeal = () => {
        setSeals([...seals, { sealCode: "", description: "" }]);
    };

    const handleRemoveSeal = (index: number) => {
        const newSeals = seals.filter((_, i) => i !== index);
        setSeals(newSeals);
    };

    const handleSealChange = (index: number, field: keyof Seal, value: string) => {
        const newSeals = [...seals];
        newSeals[index] = { ...newSeals[index], [field]: value };
        setSeals(newSeals);
    };

    const handleSubmit = () => {
        // Filter out empty seals (must have sealCode)
        const validSeals = seals.filter(
            seal => seal.sealCode.trim() !== ""
        );
        
        // Validate: must have at least 1 seal with code
        if (validSeals.length === 0) {
            // This should not happen due to button disable, but just in case
            return;
        }
        
        onComplete(validSeals);
    };

    const validSealCount = seals.filter(s => s.sealCode.trim()).length;

    return (
        <div className="seal-assignment-step">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SafetyOutlined className="text-3xl" />
                        <div>
                            <h2 className="text-2xl font-bold m-0">Gán Seal cho chuyến hàng</h2>
                            <p className="text-blue-100 text-sm m-0 mt-1">Niêm phong để đảm bảo an toàn hàng hóa</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{validSealCount}</div>
                        <div className="text-blue-100 text-sm">Seal đã thêm</div>
                    </div>
                </div>
            </div>

            <Card bordered={false} className="shadow-sm">
                {/* Info Box */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-700 m-0">
                            <strong className="text-blue-700">ℹ️ Thông tin:</strong> Seal (niêm phong) được sử dụng để đảm bảo an toàn và tính toàn vẹn của hàng hóa trong quá trình vận chuyển.
                        </p>
                        <p className="text-sm font-medium text-red-600 m-0">
                            ⚠️ Bắt buộc phải có ít nhất 1 seal trước khi hoàn thành
                        </p>
                    </div>
                </div>

                {/* Seals List */}
                {seals.length === 0 ? (
                    <Empty
                        description="Chưa có seal nào được thêm"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ marginTop: "40px", marginBottom: "40px" }}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddSeal}
                            size="large"
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            Thêm Seal đầu tiên
                        </Button>
                    </Empty>
                ) : (
                    <div className="space-y-4">
                        {seals.map((seal, index) => (
                            <Card
                                key={index}
                                size="small"
                                className="bg-white border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                title={
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                                            </div>
                                            <span className="font-medium text-gray-800">Seal #{index + 1}</span>
                                            {seal.sealCode && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    <CheckOutlined className="mr-1" />
                                                    Đã nhập
                                                </span>
                                            )}
                                        </div>
                                        {seals.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSeal(index)}
                                                className="hover:bg-red-50"
                                            >
                                                Xóa
                                            </Button>
                                        )}
                                    </div>
                                }
                            >
                                <Form layout="vertical" size="small">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={<span className="font-medium">Mã Seal <span className="text-red-500">*</span></span>}
                                                required
                                                className="mb-0"
                                            >
                                                <Input
                                                    placeholder="VD: SEAL-001"
                                                    value={seal.sealCode}
                                                    onChange={(e) =>
                                                        handleSealChange(index, "sealCode", e.target.value)
                                                    }
                                                    prefix={<SafetyOutlined className="text-gray-400" />}
                                                    size="large"
                                                    className="rounded-lg"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={<span className="font-medium">Mô tả <span className="text-gray-400 font-normal">(tùy chọn)</span></span>}
                                                className="mb-0"
                                            >
                                                <Input
                                                    placeholder="Nhập mô tả về seal"
                                                    value={seal.description}
                                                    onChange={(e) =>
                                                        handleSealChange(index, "description", e.target.value)
                                                    }
                                                    size="large"
                                                    className="rounded-lg"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card>
                        ))}

                        {/* Add More Button */}
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddSeal}
                            block
                            size="large"
                            className="mt-4 border-blue-300 text-blue-600 hover:text-blue-700 hover:border-blue-400"
                        >
                            + Thêm Seal khác
                        </Button>
                    </div>
                )}

                <Divider className="my-6" />

                {/* Action Buttons */}
                <div className="flex justify-between gap-3">
                    <Button 
                        onClick={onBack}
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        className="px-6"
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        size="large"
                        icon={<CheckOutlined />}
                        className="bg-blue-500 hover:bg-blue-600 px-8"
                        disabled={seals.length === 0 || seals.every(s => !s.sealCode.trim())}
                        title={seals.length === 0 ? "Vui lòng thêm ít nhất 1 seal" : ""}
                    >
                        Hoàn thành
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SealAssignmentStep;
