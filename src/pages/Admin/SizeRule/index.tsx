import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Button, 
    App, 
    Card, 
    Typography, 
    Tabs, 
    Table, 
    InputNumber, 
    Skeleton, 
    Empty, 
    Tag,
    Alert,
    Row,
    Col,
    Statistic,
    Divider
} from 'antd';
import { 
    DollarOutlined, 
    ReloadOutlined, 
    TruckOutlined,
    CarOutlined,
    SaveOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import type { SizeRule, BasingPrice } from '../../../models';
import sizeRuleService from '../../../services/size-rule/sizeRuleService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TableDataItem {
    vehicleTypeName: string;
    vehicleTypeDescription: string;
    minWeight: number;
    maxWeight: number;
    dimensions: string;
    rule: SizeRule;
    [key: string]: any;
}

interface EditingPrice {
    sizeRuleId: string;
    distanceRangeKey: string;
    basingPriceId?: string;
    distanceRuleId: string;
    value: number;
}

const SizeRulePage: React.FC = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [editingPrices, setEditingPrices] = useState<Map<string, EditingPrice>>(new Map());

    const {
        data: sizeRules = [],
        isLoading,
        isError,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['sizeRules'],
        queryFn: () => sizeRuleService.getSizeRulesFull(),
    });

    const updatePriceMutation = useMutation({
        mutationFn: async (data: { id?: string; basePrice: number; sizeRuleId: string; distanceRuleId: string }) => {
            if (data.id) {
                return sizeRuleService.updateBasingPrice(data.id, {
                    basePrice: data.basePrice,
                    sizeRuleId: data.sizeRuleId,
                    distanceRuleId: data.distanceRuleId
                });
            } else {
                return sizeRuleService.createBasingPrice({
                    basePrice: data.basePrice,
                    sizeRuleId: data.sizeRuleId,
                    distanceRuleId: data.distanceRuleId
                });
            }
        },
        onSuccess: () => {
            message.success('Cập nhật giá thành công');
            queryClient.invalidateQueries({ queryKey: ['sizeRules'] });
            setEditingPrices(new Map());
        },
        onError: (error) => {
            message.error('Không thể cập nhật giá: ' + (error as Error).message);
        }
    });

    // Filter to only active rules
    const filteredRules = sizeRules.filter((rule: SizeRule) => rule.status === 'ACTIVE');

    // Get unique categories - dùng description làm tên hiển thị
    const getCategories = () => {
        const categoriesMap = new Map<string, { id: string; name: string; description: string }>();
        filteredRules.forEach((rule: SizeRule) => {
            if (!categoriesMap.has(rule.category.id)) {
                categoriesMap.set(rule.category.id, {
                    id: rule.category.id,
                    name: rule.category.categoryName,
                    description: rule.category.description || rule.category.categoryName
                });
            }
        });
        return Array.from(categoriesMap.values());
    };

    const categories = getCategories();

    // Set initial active category
    React.useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0].id);
        }
    }, [categories, activeCategory]);

    // Get rules filtered by active category
    const getCategoryRules = () => {
        if (!activeCategory) return [];
        return filteredRules.filter((rule: SizeRule) => rule.category.id === activeCategory);
    };

    // Get unique vehicle types
    const getUniqueVehicleTypes = () => {
        const uniqueVehicleTypes = new Map<string, SizeRule>();
        getCategoryRules().forEach((rule: SizeRule) => {
            const key = rule.vehicleTypeEntity.id;
            if (!uniqueVehicleTypes.has(key) ||
                (rule.basingPrices.length > 0 && uniqueVehicleTypes.get(key)?.basingPrices.length === 0)) {
                uniqueVehicleTypes.set(key, rule);
            }
        });
        return Array.from(uniqueVehicleTypes.values());
    };

    const uniqueRules = getUniqueVehicleTypes();

    // Format khoảng cách: 4KM ĐẦU, 4KM - 15KM, 15KM - 100KM, >100KM
    const formatDistanceRange = (fromKm: number, toKm: number): string => {
        // Mức đầu tiên: 0 - 3.99km -> "4KM ĐẦU"
        if (fromKm === 0) {
            const upper = Math.round(toKm + 0.01);
            return `${upper}KM ĐẦU`;
        }

        // Mức cuối: >100km
        if (toKm >= 99999 || toKm > 9999) {
            return `>${fromKm}KM`;
        }

        // Các mức còn lại: hiển thị from nguyên và to làm tròn lên
        const upper = Math.round(toKm + 0.01);
        return `${fromKm}KM - ${upper}KM`;
    };

    // Kiểm tra xem có phải là basing price (giá cố định) hay giá theo km
    const isBasingPrice = (fromKm: number): boolean => {
        return fromKm === 0; // Chỉ mức đầu tiên (0-4km) là giá cố định
    };

    // Get category color
    const getCategoryColor = (categoryName: string) => {
        switch (categoryName.toUpperCase()) {
            case 'NORMAL': return '#52c41a';
            case 'FRAGILE': return '#fa8c16';
            default: return '#1890ff';
        }
    };

    // Create price table data
    const createPriceTableData = () => {
        const allDistanceRanges: Array<{ from: number; to: number; id: string }> = [];

        uniqueRules.forEach(rule => {
            if (rule.basingPrices && rule.basingPrices.length > 0) {
                rule.basingPrices.forEach(price => {
                    const { fromKm, toKm, id } = price.distanceRuleResponse;
                    const existingRange = allDistanceRanges.find(
                        range => range.from === fromKm && range.to === toKm
                    );
                    if (!existingRange) {
                        allDistanceRanges.push({ from: fromKm, to: toKm, id });
                    }
                });
            }
        });

        allDistanceRanges.sort((a, b) => a.from - b.from);

        const tableData = uniqueRules.map(rule => {
            const baseData: TableDataItem = {
                vehicleTypeName: rule.vehicleTypeEntity.vehicleTypeName,
                vehicleTypeDescription: rule.vehicleTypeEntity.description || rule.vehicleTypeEntity.vehicleTypeName,
                minWeight: rule.minWeight,
                maxWeight: rule.maxWeight,
                dimensions: `${rule.minLength}×${rule.minWidth}×${rule.minHeight} - ${rule.maxLength}×${rule.maxWidth}×${rule.maxHeight}`,
                rule: rule,
            };

            allDistanceRanges.forEach(range => {
                const priceForRange = rule.basingPrices?.find(
                    price =>
                        price.distanceRuleResponse.fromKm === range.from &&
                        price.distanceRuleResponse.toKm === range.to
                );
                const columnKey = `${range.from}-${range.to}`;
                baseData[columnKey] = priceForRange ? {
                    id: priceForRange.id,
                    value: parseInt(priceForRange.basePrice),
                    distanceRuleId: priceForRange.distanceRuleResponse.id
                } : { id: null, value: null, distanceRuleId: range.id };
            });

            return baseData;
        }).sort((a, b) => a.minWeight - b.minWeight);

        return {
            data: tableData,
            distanceRanges: allDistanceRanges
        };
    };

    const priceTableResult = createPriceTableData();

    // Handle price change
    const handlePriceChange = (
        sizeRuleId: string, 
        distanceRangeKey: string, 
        basingPriceId: string | null, 
        distanceRuleId: string,
        value: number | null
    ) => {
        const key = `${sizeRuleId}-${distanceRangeKey}`;
        if (value !== null) {
            setEditingPrices(prev => {
                const newMap = new Map(prev);
                newMap.set(key, {
                    sizeRuleId,
                    distanceRangeKey,
                    basingPriceId: basingPriceId || undefined,
                    distanceRuleId,
                    value
                });
                return newMap;
            });
        } else {
            setEditingPrices(prev => {
                const newMap = new Map(prev);
                newMap.delete(key);
                return newMap;
            });
        }
    };

    // Save all edited prices
    const handleSaveAll = async () => {
        const promises = Array.from(editingPrices.values()).map(edit => 
            updatePriceMutation.mutateAsync({
                id: edit.basingPriceId,
                basePrice: edit.value,
                sizeRuleId: edit.sizeRuleId,
                distanceRuleId: edit.distanceRuleId
            })
        );

        try {
            await Promise.all(promises);
        } catch (error) {
            // Error handled in mutation
        }
    };

    // Create columns for specifications table
    const specificationsColumns = [
        {
            title: 'Loại xe',
            key: 'vehicleTypeName',
            width: '25%',
            render: (_: unknown, record: TableDataItem) => (
                <div className="flex items-center">
                    <TruckOutlined className="mr-2 text-blue-500" />
                    <Text strong>{record.vehicleTypeDescription}</Text>
                </div>
            )
        },
        {
            title: 'Trọng lượng (tấn)',
            key: 'weight',
            width: '25%',
            render: (_: unknown, record: TableDataItem) => (
                <Tag color="blue">{record.minWeight} - {record.maxWeight}</Tag>
            ),
        },
        {
            title: 'Kích thước thùng xe (DxRxC) (m)',
            dataIndex: 'dimensions',
            key: 'dimensions',
            width: '50%',
            render: (text: string) => <Text code>{text}</Text>
        },
    ];

    // Create columns for price table with editable cells
    const createPriceColumns = () => {
        const columns: any[] = [
            {
                title: 'Loại xe',
                key: 'vehicleTypeName',
                fixed: 'left' as const,
                width: 180,
                render: (_: unknown, record: TableDataItem) => (
                    <div className="flex items-center">
                        <TruckOutlined className="mr-2 text-blue-500" />
                        <Text strong>{record.vehicleTypeDescription}</Text>
                    </div>
                )
            },
            {
                title: 'Tải trọng (tấn)',
                key: 'weight',
                width: 120,
                render: (_: unknown, record: TableDataItem) => (
                    <Tag color="blue">{record.minWeight} - {record.maxWeight}</Tag>
                ),
            },
        ];

        priceTableResult.distanceRanges.forEach(range => {
            const columnKey = `${range.from}-${range.to}`;
            const isBasing = isBasingPrice(range.from);
            columns.push({
                title: formatDistanceRange(range.from, range.to),
                dataIndex: columnKey,
                key: columnKey,
                width: 160,
                align: 'right' as const,
                render: (priceData: { id: string | null; value: number | null; distanceRuleId: string }, record: TableDataItem) => {
                    const editKey = `${record.rule.id}-${columnKey}`;
                    const editingValue = editingPrices.get(editKey);
                    const currentValue = editingValue?.value ?? priceData?.value;
                    const isEdited = editingPrices.has(editKey);

                    return (
                        <InputNumber
                            value={currentValue}
                            onChange={(value) => handlePriceChange(
                                record.rule.id,
                                columnKey,
                                priceData?.id,
                                priceData?.distanceRuleId || range.id,
                                value
                            )}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            min={0}
                            step={1000}
                            style={{ 
                                width: '100%',
                                borderColor: isEdited ? '#52c41a' : undefined,
                                backgroundColor: isEdited ? '#f6ffed' : undefined
                            }}
                            suffix={isBasing ? 'đ' : 'đ/km'}
                        />
                    );
                },
            });
        });

        return columns;
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    }

    if (isError || filteredRules.length === 0) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <Empty description="Không có dữ liệu bảng giá" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} className="flex items-center m-0 text-blue-800">
                        <span className="mr-3 text-blue-600"><DollarOutlined /></span> Quản lý bảng giá
                    </Title>
                    <Text type="secondary">Xem và chỉnh sửa giá vận chuyển theo loại xe và khoảng cách</Text>
                </div>
                <Button
                    icon={<ReloadOutlined spin={isFetching} />}
                    onClick={() => refetch()}
                    loading={isFetching}
                >
                    Làm mới
                </Button>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={8}>
                    <Card className="text-center shadow-sm border-t-4 border-t-blue-500">
                        <Statistic
                            title="Loại xe"
                            value={uniqueRules.length}
                            prefix={<CarOutlined className="text-blue-500" />}
                            suffix="loại"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center shadow-sm border-t-4 border-t-green-500">
                        <Statistic
                            title="Loại hàng"
                            value={categories.length}
                            prefix={<TruckOutlined className="text-green-500" />}
                            suffix="loại"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center shadow-sm border-t-4 border-t-orange-500">
                        <Statistic
                            title="Mức khoảng cách"
                            value={priceTableResult.distanceRanges.length}
                            prefix={<InfoCircleOutlined className="text-orange-500" />}
                            suffix="mức"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Category Tabs */}
            <Tabs
                activeKey={activeCategory}
                onChange={setActiveCategory}
                type="card"
                className="mb-4"
            >
                {categories.map(category => (
                    <TabPane
                        tab={
                            <span>
                                <span style={{
                                    display: 'inline-block',
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: getCategoryColor(category.name),
                                    marginRight: 8
                                }}></span>
                                {category.description}
                            </span>
                        }
                        key={category.id}
                    />
                ))}
            </Tabs>

            {/* Category Description */}
            {/* {categories.find(c => c.id === activeCategory) && (
                <Alert
                    message={`Mô tả: ${categories.find(c => c.id === activeCategory)?.description}`}
                    type="info"
                    showIcon
                    className="mb-4"
                />
            )} */}

            {/* Specifications Table */}
            <Card className="mb-6 shadow-sm">
                <div className="text-center bg-blue-600 py-3 mb-4 rounded">
                    <Title level={5} className="logistic-section-title m-0">
                        <CarOutlined className="mr-2" />
                        QUY CHUẨN HÀNG HÓA VẬN CHUYỂN XE TẢI
                    </Title>
                </div>
                <Table
                    className="logistic-table-header"
                    dataSource={priceTableResult.data}
                    columns={specificationsColumns}
                    pagination={false}
                    rowKey="vehicleTypeName"
                    bordered
                    size="middle"
                    locale={{ emptyText: 'Không có dữ liệu' }}
                />
            </Card>

            {/* Price Table - Editable */}
            <Card className="shadow-sm">
                <div className="text-center bg-green-600 py-3 mb-4 rounded">
                    <Title level={5} className="logistic-section-title m-0">
                        <DollarOutlined className="mr-2" />
                        BẢNG GIÁ CƯỚC VẬN CHUYỂN XE TẢI (ĐƠN VỊ: VNĐ)
                    </Title>
                </div>
                
                {editingPrices.size > 0 && (
                    <Alert
                        message={`Bạn đang chỉnh sửa ${editingPrices.size} giá. Nhấn "Lưu thay đổi" để áp dụng.`}
                        type="warning"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Table
                    className="logistic-table-header"
                    dataSource={priceTableResult.data}
                    columns={createPriceColumns()}
                    pagination={false}
                    rowKey="vehicleTypeName"
                    scroll={{ x: 'max-content' }}
                    bordered
                    size="middle"
                    locale={{ emptyText: 'Không có dữ liệu giá' }}
                />
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Text type="secondary">
                        <InfoCircleOutlined className="mr-2" />
                        <strong>Hướng dẫn:</strong> Nhập giá mới vào ô tương ứng. Ô có nền xanh là ô đã được chỉnh sửa. Nhấn "Lưu thay đổi" để áp dụng tất cả thay đổi.
                    </Text>
                </div>

                {/* Nút Lưu thay đổi ở dưới table */}
                {editingPrices.size > 0 && (
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSaveAll}
                            loading={updatePriceMutation.isPending}
                            size="large"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Lưu thay đổi ({editingPrices.size})
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SizeRulePage;
