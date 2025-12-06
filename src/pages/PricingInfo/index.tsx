import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Typography, 
  Card, 
  Table, 
  Tabs, 
  Skeleton, 
  Empty, 
  Tag, 
  Collapse, 
  Row, 
  Col, 
  Statistic,
  Divider,
  Alert,
  Space,
  Tooltip
} from 'antd';
import { 
  DollarOutlined, 
  CarOutlined, 
  SafetyOutlined, 
  InfoCircleOutlined,
  FileProtectOutlined,
  QuestionCircleOutlined,
  TruckOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import publicPricingService from '../../services/public/publicPricingService';
import carrierSettingService from '../../services/carrier/carrierSettingService';
import { useInsuranceRates } from '../../hooks';
import type { SizeRule, BasingPrice } from '../../models';
import type { CarrierSettingsResponse } from '../../models/Carrier';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface TableDataItem {
  vehicleTypeName: string;
  minWeight: number;
  maxWeight: number;
  dimensions: string;
  rule: SizeRule;
  [key: string]: any;
}

const PricingInfoPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');

  const { normalRatePercent, fragileRatePercent } = useInsuranceRates();

  const { data: sizeRules = [], isLoading, isError } = useQuery({
    queryKey: ['sizeRulesPublic'],
    queryFn: () => publicPricingService.getPublicSizeRules(),
  });

  // Lấy thông tin carrier settings
  const { data: carrierSettings } = useQuery<CarrierSettingsResponse | null>({
    queryKey: ['carrierSettings'],
    queryFn: () => carrierSettingService.getCarrierSettings(),
    staleTime: 1000 * 60 * 30, // Cache 30 phút
  });

  // Filter to only active rules
  const filteredRules = sizeRules.filter((rule: SizeRule) => rule.status === 'ACTIVE');

  // Get unique categories - dùng description làm tên hiển thị tiếng Việt
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

  // Không cần getCategoryNameVi nữa vì sẽ dùng categoryDescription từ API

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toUpperCase()) {
      case 'NORMAL': return '#52c41a';
      case 'BULKY CARGO': return '#fa8c16';
      case 'DANGEROUS': return '#f5222d';
      default: return '#1890ff';
    }
  };

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

  // Create price table data
  const createPriceTableData = () => {
    const allDistanceRanges: Array<{ from: number; to: number }> = [];

    uniqueRules.forEach(rule => {
      if (rule.basingPrices && rule.basingPrices.length > 0) {
        rule.basingPrices.forEach(price => {
          const { fromKm, toKm } = price.distanceRuleResponse;
          const existingRange = allDistanceRanges.find(
            range => range.from === fromKm && range.to === toKm
          );
          if (!existingRange) {
            allDistanceRanges.push({ from: fromKm, to: toKm });
          }
        });
      }
    });

    allDistanceRanges.sort((a, b) => a.from - b.from);

    const tableData = uniqueRules.map(rule => {
      const baseData: TableDataItem = {
        vehicleTypeName: rule.vehicleTypeEntity.vehicleTypeName,
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
        baseData[columnKey] = priceForRange ? parseInt(priceForRange.basePrice) : null;
      });

      return baseData;
    }).sort((a, b) => a.minWeight - b.minWeight);

    return {
      data: tableData,
      distanceRanges: allDistanceRanges
    };
  };

  const priceTableResult = createPriceTableData();

  // Create columns for price table - dùng vehicleTypeDescription
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
            <Text strong>{record.rule.vehicleTypeEntity.description || record.vehicleTypeName}</Text>
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
      const isBasing = isBasingPrice(range.from);
      columns.push({
        title: formatDistanceRange(range.from, range.to),
        dataIndex: `${range.from}-${range.to}`,
        key: `${range.from}-${range.to}`,
        width: 140,
        align: 'right' as const,
        render: (price: number | null) => {
          if (!price) return <Text type="secondary">-</Text>;
          // Mức đầu tiên là giá cố định, các mức sau là giá/km
          return (
            <Text strong className="text-green-600">
              {price.toLocaleString('vi-VN')} {isBasing ? 'đ' : 'đ/km'}
            </Text>
          );
        },
      });
    });

    return columns;
  };

  // Specifications columns - dùng vehicleTypeDescription
  const specificationsColumns = [
    {
      title: 'Loại xe',
      key: 'vehicleTypeName',
      width: '25%',
      render: (_: unknown, record: TableDataItem) => (
        <div className="flex items-center">
          <TruckOutlined className="mr-2 text-blue-500" />
          <Text strong>{record.rule.vehicleTypeEntity.description || record.vehicleTypeName}</Text>
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || filteredRules.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty description="Không có dữ liệu bảng giá" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-blue-700 mb-2">
          <DollarOutlined className="mr-3" />
          Thông tin cước vận chuyển
        </Title>
        <Text type="secondary" className="text-lg">
          Bảng giá vận chuyển xe tải - Cập nhật mới nhất
        </Text>
      </div>

      {/* Quick Info Cards */}
      <Row gutter={[16, 16]} className="mb-8" align="stretch">
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full text-center shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500"
            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Statistic
              title="Loại xe"
              value={uniqueRules.length}
              prefix={<CarOutlined className="text-blue-500" />}
              suffix="loại"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full text-center shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-green-500"
            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Statistic
              title="Loại hàng hỗ trợ"
              value={categories.length}
              prefix={<TruckOutlined className="text-green-500" />}
              suffix="loại"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full text-center shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-orange-500"
            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Statistic
              title="Mức khoảng cách"
              value={priceTableResult.distanceRanges.length}
              prefix={<InfoCircleOutlined className="text-orange-500" />}
              suffix="mức"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full text-center shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500"
            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <div className="flex flex-col items-center text-center">
              <SafetyOutlined className="text-2xl text-purple-500 mb-2" />
              <Text strong>Bảo hiểm hàng hóa (tùy chọn)</Text>
              <Text type="secondary" className="text-xs md:text-sm">
                Phí từ <strong>{normalRatePercent.toFixed(3)}% - {fragileRatePercent.toFixed(3)}%</strong> giá trị khai báo, bồi thường theo tỷ lệ hư hại × giá trị hàng khi CÓ chứng từ.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs defaultActiveKey="pricing" size="large" className="mb-8">
        <TabPane
          tab={
            <span>
              <DollarOutlined />
              Bảng giá vận chuyển
            </span>
          }
          key="pricing"
        >
          {/* Category Tabs - dùng description làm tên hiển thị */}
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

          {/* Category Description - hiển thị mô tả loại hàng */}
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

          {/* Price Table */}
          <Card className="shadow-sm">
            <div className="text-center bg-green-600 py-3 mb-4 rounded">
              <Title level={5} className="logistic-section-title m-0">
                <DollarOutlined className="mr-2" />
                BẢNG GIÁ CƯỚC VẬN CHUYỂN XE TẢI (ĐƠN VỊ: VNĐ)
              </Title>
            </div>
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
                <strong>Lưu ý:</strong> Giá trên là giá cơ bản, có thể thay đổi tùy thuộc vào loại hàng hóa, điều kiện vận chuyển và các yếu tố khác.
              </Text>
            </div>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SafetyOutlined />
              Chính sách bảo hiểm
            </span>
          }
          key="insurance"
        >
          <Card className="shadow-sm">
            <Title level={4} className="text-blue-700 mb-4">
              <SafetyOutlined className="mr-2" />
              Chính sách bảo hiểm hàng hóa
            </Title>
            
            <Alert
              message="Lưu ý quan trọng"
              description="Phí bảo hiểm được quy định bởi Công ty Bảo hiểm đối tác. Bên Vận Chuyển chỉ đóng vai trò là đại lý thu hộ phí này."
              type="info"
              showIcon
              className="mb-4"
            />

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="h-full bg-blue-50 border-blue-200">
                  <Title level={5} className="text-blue-700">
                    <CheckCircleOutlined className="mr-2" />
                    Hàng hóa thông thường
                  </Title>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Tỷ lệ phí bảo hiểm: <strong>{normalRatePercent.toFixed(3)}%</strong> x Giá trị khai báo</li>
                    <li>Phí đã bao gồm thuế VAT</li>
                    <li>Áp dụng cho: đồ gia dụng, hàng điện tử, hàng tiêu dùng, vật liệu xây dựng</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="h-full bg-orange-50 border-orange-200">
                  <Title level={5} className="text-orange-700">
                    <WarningOutlined className="mr-2" />
                    Hàng dễ vỡ / Rủi ro cao
                  </Title>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Tỷ lệ phí bảo hiểm: <strong>{fragileRatePercent.toFixed(3)}%</strong> x Giá trị khai báo</li>
                    <li>Phí đã bao gồm thuế VAT</li>
                    <li>Yêu cầu đóng gói đúng quy cách (xốp, kiện gỗ, nhãn cảnh báo)</li>
                  </ul>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="h-full bg-green-50 border-green-200">
                  <Title level={5} className="text-green-700">
                    <DollarOutlined className="mr-2" />
                    Mức bồi thường khi CÓ bảo hiểm
                  </Title>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Bồi thường theo <strong>Tỷ lệ hư hại thực tế × Giá trị khai báo</strong></li>
                    <li>Điều kiện: Phải có Hóa đơn VAT, chứng từ mua bán hợp pháp</li>
                    <li>Thời gian giải quyết: <strong>7-14 ngày</strong> làm việc</li>
                  </ul>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="h-full bg-gray-50 border-gray-200">
                  <Title level={5} className="text-gray-700">
                    <InfoCircleOutlined className="mr-2" />
                    Mức bồi thường khi KHÔNG có bảo hiểm
                  </Title>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Giới hạn tối đa: <strong>10 lần cước phí vận chuyển</strong></li>
                    <li>Theo quy định Điều 546 Luật Thương mại 2005</li>
                    <li>Áp dụng khi không có chứng từ chứng minh giá trị</li>
                  </ul>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={5} className="text-red-600 mb-4">
              <WarningOutlined className="mr-2" />
              Trường hợp bảo hiểm VÔ HIỆU
            </Title>
            <Alert
              type="error"
              message={
                <ul className="list-disc pl-5 space-y-1 mb-0">
                  <li>Không cung cấp được Hóa đơn VAT, chứng từ mua bán hợp pháp khi xảy ra sự cố</li>
                  <li>Hàng hóa không khai báo hoặc khai báo sai giá trị</li>
                  <li>Hàng hóa cấm vận chuyển theo quy định pháp luật</li>
                  <li>Hàng dễ vỡ không được đóng gói đúng quy cách (thiếu xốp, kiện gỗ, nhãn cảnh báo)</li>
                  <li>Thiệt hại do chiến tranh, khủng bố, bất khả kháng</li>
                </ul>
              }
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileProtectOutlined />
              Quy định vận chuyển
            </span>
          }
          key="regulations"
        >
          <Card className="shadow-sm">
            <Title level={4} className="text-blue-700 mb-4">
              <FileProtectOutlined className="mr-2" />
              Quy định vận chuyển hàng hóa
            </Title>

            <Alert
              message="Nguyên tắc phân loại"
              description="Mỗi đơn hàng chỉ được đăng ký cho một loại hàng hóa duy nhất. Không chấp nhận trộn lẫn các loại hàng để đảm bảo tính toán phí bảo hiểm chính xác."
              type="info"
              showIcon
              className="mb-4"
            />

            <Collapse defaultActiveKey={['1', '2']} className="mb-4">
              <Panel header={<Text strong><CheckCircleOutlined className="mr-2 text-green-500" />Hàng hóa thông thường (NORMAL)</Text>} key="1">
                <Paragraph>
                  Hàng hóa thông thường bao gồm các mặt hàng không thuộc danh mục hàng dễ vỡ hoặc hàng cấm. 
                  Áp dụng bảng giá cơ bản và phí bảo hiểm <strong>{normalRatePercent.toFixed(3)}%</strong> giá trị khai báo.
                </Paragraph>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Title level={5} className="text-green-600">Hàng hóa được chấp nhận:</Title>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Hàng tiêu dùng nhanh (FMCG)</li>
                      <li>Hàng điện tử, máy móc</li>
                      <li>Hàng may mặc, tài liệu/bưu phẩm</li>
                      <li>Đồ gia dụng, nội thất</li>
                      <li>Vật liệu xây dựng thông thường</li>
                    </ul>
                  </Col>
                  <Col xs={24} md={12}>
                    <Title level={5} className="text-blue-600">Quy định:</Title>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Trọng lượng tổng: <strong>0.01 - 50 tấn</strong></li>
                      <li>Trọng lượng mỗi kiện: <strong>0.01 - 10 tấn</strong></li>
                      <li>Khách hàng chịu trách nhiệm đóng gói</li>
                      <li>Phải có chứng từ, hóa đơn đi đường</li>
                    </ul>
                  </Col>
                </Row>
              </Panel>
              <Panel header={<Text strong><WarningOutlined className="mr-2 text-orange-500" />Hàng dễ vỡ (FRAGILE)</Text>} key="2">
                <Paragraph>
                  Hàng dễ vỡ yêu cầu đóng gói đặc biệt và cẩn thận trong quá trình vận chuyển. 
                  Áp dụng phí bảo hiểm <strong>{fragileRatePercent.toFixed(3)}%</strong> giá trị khai báo.
                </Paragraph>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Title level={5} className="text-orange-600">Yêu cầu đóng gói:</Title>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Bọc xốp chống sốc đầy đủ</li>
                      <li>Kiện gỗ hoặc thùng carton cứng</li>
                      <li>Dán nhãn cảnh báo "FRAGILE" / "DỄ VỠ"</li>
                      <li>Không xếp chồng quá tải trọng cho phép</li>
                    </ul>
                  </Col>
                  <Col xs={24} md={12}>
                    <Alert
                      type="warning"
                      message="Lưu ý quan trọng"
                      description={
                        <ul className="list-disc pl-5 space-y-1 mb-0">
                          <li>Tài xế có quyền kiểm tra quy cách đóng gói</li>
                          <li>Nếu không đạt chuẩn, Tài xế có quyền từ chối vận chuyển</li>
                          <li>Bảo hiểm vô hiệu nếu đóng gói không đúng quy cách</li>
                        </ul>
                      }
                    />
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <Divider />

            <Title level={5} className="text-red-600 mb-4">
              <WarningOutlined className="mr-2" />
              Hàng hóa CẤM VẬN CHUYỂN
            </Title>
            <Alert
              type="error"
              message="Miễn trừ trách nhiệm pháp lý"
              description={
                <ul className="list-disc pl-5 space-y-1 mb-0">
                  <li>Thực phẩm tươi sống, hàng đông lạnh, sinh vật sống</li>
                  <li>Vũ khí, đạn dược, vật liệu nổ, chất ma túy, chất kích thích</li>
                  <li>Tiền mặt, đá quý, các giấy tờ có giá trị như tiền</li>
                  <li>Bất kỳ hàng hóa nào bị pháp luật Việt Nam cấm lưu thông</li>
                </ul>
              }
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <QuestionCircleOutlined />
              Câu hỏi thường gặp
            </span>
          }
          key="faq"
        >
          <Card className="shadow-sm">
            <Title level={4} className="text-blue-700 mb-4">
              <QuestionCircleOutlined className="mr-2" />
              Câu hỏi thường gặp
            </Title>

            <Collapse defaultActiveKey={['1']}>
              <Panel header="Khu vực nào được phục vụ?" key="1">
                <Paragraph>
                  Hiện tại chúng tôi <strong>CHỈ phục vụ nội thành TP. Hồ Chí Minh</strong>.
                </Paragraph>
                <ul className="list-disc pl-5 space-y-1">
                  <li>✅ Phương tiện: <strong>XE TẢI duy nhất</strong></li>
                  <li>❌ KHÔNG hỗ trợ: Xe máy, xe ba gác, container đầu kéo</li>
                  <li>✅ Tải trọng: <strong>0.5 tấn đến 50 tấn</strong></li>
                  <li>⚠️ Liên tỉnh: Cần liên hệ riêng để được tư vấn</li>
                </ul>
              </Panel>
              <Panel header="Hình thức thanh toán nào được chấp nhận?" key="2">
                <Paragraph>
                  <strong>CHỈ CHẤP NHẬN THANH TOÁN ONLINE</strong> qua cổng thanh toán PayOS:
                </Paragraph>
                <ul className="list-disc pl-5 space-y-1">
                  <li>✅ <strong>QUÉT MÃ QR</strong> chuyển khoản</li>
                  <li>❌ <strong>KHÔNG</strong> chấp nhận: Thẻ ATM nội địa, Thẻ Visa/Mastercard, Ví điện tử</li>
                  <li>❌ <strong>KHÔNG</strong> chấp nhận tiền mặt (COD)</li>
                </ul>
              </Panel>
              <Panel header="Khi nào phải thanh toán?" key="3">
                <Alert
                  type="warning"
                  message="QUY ĐỊNH NGHIÊM NGẶT"
                  description={
                    <ul className="list-disc pl-5 space-y-1 mb-0">
                      <li><strong>Ký hợp đồng:</strong> Trong vòng 24 giờ sau khi nhân viên gửi</li>
                      <li><strong>Đặt cọc:</strong> Trong vòng 24 giờ sau khi ký hợp đồng (nếu không → HỦY TỰ ĐỘNG)</li>
                      <li><strong>Thanh toán toàn bộ:</strong> Tối thiểu 1 ngày trước ngày lấy hàng dự kiến</li>
                    </ul>
                  }
                  className="mb-0"
                />
              </Panel>
              <Panel header="Nếu TÔI MUA bảo hiểm thì được gì?" key="4">
                <Paragraph>
                  Khi <strong>MUA BẢO HIỂM</strong> và xảy ra sự cố hư hỏng/mất mát:
                </Paragraph>
                <ul className="list-disc pl-5 space-y-1">
                  <li>✅ <strong>Mức bồi thường:</strong> Tỷ lệ hư hại thực tế × Giá trị Khai báo</li>
                  <li>✅ <strong>Ví dụ:</strong> Hàng khai báo 50.000.000 VNĐ, hư hỏng 30% → Bồi thường 15.000.000 VNĐ</li>
                </ul>
                <Alert
                  type="warning"
                  message="ĐIỀU KIỆN BẮT BUỘC: Phải có Hóa đơn VAT, chứng từ mua bán hợp pháp chứng minh giá trị hàng hóa. Nếu không → Bảo hiểm bị VÔ HIỆU HÓA."
                  className="mt-2"
                />
              </Panel>
              <Panel header="Nếu TÔI KHÔNG MUA bảo hiểm thì sao?" key="5">
                <Paragraph>
                  Khi <strong>KHÔNG MUA BẢO HIỂM</strong> hoặc <strong>KHÔNG CÓ CHỨNG TỪ</strong> (theo Điều 546 Luật Thương mại 2005):
                </Paragraph>
                <Alert
                  type="error"
                  message={
                    <ul className="list-disc pl-5 space-y-1 mb-0">
                      <li>⚠️ <strong>Mức bồi thường TỐI ĐA:</strong> 10 lần cước phí vận chuyển</li>
                      <li>⚠️ <strong>Ví dụ:</strong> Cước phí 500.000 VNĐ → Bồi thường tối đa = 5.000.000 VNĐ (dù hàng thực tế trị giá 100.000.000 VNĐ)</li>
                    </ul>
                  }
                />
              </Panel>
              <Panel header="Loại hàng nào được và KHÔNG được vận chuyển?" key="6">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Title level={5} className="text-green-600">✅ ĐƯỢC CHẤP NHẬN:</Title>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Hàng tiêu dùng nhanh (FMCG)</li>
                      <li>Hàng điện tử, may mặc</li>
                      <li>Tài liệu, bưu phẩm</li>
                      <li>Hàng hóa thông thường</li>
                    </ul>
                  </Col>
                  <Col xs={24} md={12}>
                    <Title level={5} className="text-red-600">❌ CẤM VẬN CHUYỂN:</Title>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Thực phẩm tươi sống, hàng đông lạnh, động vật sống</li>
                      <li>Vũ khí, đạn dược, vật liệu nổ</li>
                      <li>Chất ma túy, chất kích thích</li>
                      <li>Hàng cấm lưu thông theo pháp luật VN</li>
                    </ul>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Nếu hàng bị hư hỏng thì sao?" key="7">
                <Paragraph>
                  <strong>QUY TRÌNH XỬ LÝ SỰ CỐ:</strong>
                </Paragraph>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Báo ngay tại chỗ khi nhận hàng (chụp ảnh/video minh chứng)</li>
                  <li>TỪ CHỐI ký nhận nếu phát hiện hư hỏng</li>
                  <li>Tài xế lập biên bản sự cố, upload hệ thống</li>
                  <li>Nhân viên kiểm tra seal, ảnh lúc lấy/giao hàng</li>
                  <li>Đánh giá tỷ lệ hư hỏng</li>
                </ol>
                <Alert
                  type="info"
                  message="Thời gian xử lý: 7-14 ngày làm việc. Thời hiệu khiếu nại tối đa 03 tháng."
                  className="mt-2"
                />
              </Panel>
            </Collapse>
          </Card>
        </TabPane>
      </Tabs>

      {/* Contact Section - Lấy từ carrier settings */}
      <Card className="bg-blue-50 border-blue-200 text-center">
        <Title level={5} className="text-blue-700">
          Cần hỗ trợ thêm?
        </Title>
        <Paragraph>
          {carrierSettings ? (
            <>
              Liên hệ hotline: <Text strong className="text-blue-600">{carrierSettings.carrierPhone}</Text> hoặc email: <Text strong className="text-blue-600">{carrierSettings.carrierEmail}</Text>
            </>
          ) : (
            <>Vui lòng liên hệ nhân viên hỗ trợ</>
          )}
        </Paragraph>
        {carrierSettings?.carrierAddressLine && (
          <Paragraph className="text-gray-600">
            Địa chỉ: {carrierSettings.carrierAddressLine}
          </Paragraph>
        )}
      </Card>
    </div>
  );
};

export default PricingInfoPage;
