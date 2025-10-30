import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Empty,
  Button,
  App,
  Alert,
  Divider,
  Statistic,
  Row,
  Col,
  Spin,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  CreditCardOutlined,
  DollarOutlined,
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  FileProtectOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import orderService from "../../../../services/order/orderService";
import { ContractStatusTag } from "../../../../components/common/tags";
import { ContractStatusEnum } from "../../../../constants/enums";

// Utility function to safely parse contract values
const parseContractValue = (value: string | number | undefined): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
  return isNaN(numericValue) ? 0 : numericValue;
};

// Define types for price details from contract PDF API
interface PriceStep {
  vehicleRuleName: string;
  numOfVehicles: number;
  distanceRange: string;
  unitPrice: number;
  appliedKm: number;
  subtotal: number;
}

interface PriceDetails {
  totalPrice: number;
  totalBeforeAdjustment: number;
  categoryExtraFee: number;
  categoryMultiplier: number;
  promotionDiscount: number;
  finalTotal: number;
  steps: PriceStep[];
  summary?: string;
}

interface ContractProps {
  contract?: {
    id: string;
    contractName: string;
    effectiveDate: string;
    expirationDate: string;
    totalValue: number;
    adjustedValue: number;
    description: string;
    attachFileUrl: string;
    status: string;
    staffName: string;
  };
  orderStatus?: string;
  depositAmount?: number;
  priceDetails?: PriceDetails;
  loadingPriceDetails?: boolean;
}

const ContractSection: React.FC<ContractProps> = ({
  contract,
  orderStatus,
  depositAmount,
  priceDetails,
  loadingPriceDetails = false,
}) => {
  const messageApi = App.useApp().message;
  const hasAdjustedValue = Boolean(contract?.adjustedValue && contract.adjustedValue !== 0);
  const [signingContract, setSigningContract] = useState<boolean>(false);
  const [payingDeposit, setPayingDeposit] = useState<boolean>(false);
  const [payingFullAmount, setPayingFullAmount] = useState<boolean>(false);

  const parseCurrencyValue = (value?: string | number | null) => {
    if (value === undefined || value === null) {
      return 0;
    }

    if (typeof value === "number") {
      return value;
    }

    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return Number.isNaN(numericValue) ? 0 : numericValue;
  };

  const formatCurrency = (amount: number) => amount.toLocaleString("vi-VN");

  const totalValue = parseCurrencyValue(contract?.totalValue);
  const adjustedValue = parseCurrencyValue(contract?.adjustedValue);
  const depositAmountValue = depositAmount ?? 0;
  const baseContractValue = hasAdjustedValue ? adjustedValue : totalValue;
  const remainingAmount = Math.max(baseContractValue - depositAmountValue, 0);

  const paymentStats = [
    {
      key: "totalValue",
      title: "Tổng giá trị đơn hàng",
      value: formatCurrency(totalValue),
      prefix: <DollarOutlined />,
      valueStyle: { color: "#1890ff" },
      suffix: undefined,
    },
    hasAdjustedValue
      ? {
          key: "adjustedValue",
          title: "Giá trị điều chỉnh",
          value: formatCurrency(adjustedValue),
          prefix: <DollarOutlined />,
          valueStyle: { color: "#722ed1" },
          suffix: undefined,
        }
      : null,
    {
      key: "depositAmount",
      title: "Số tiền cọc cần thanh toán",
      value: formatCurrency(depositAmountValue),
      prefix: <CreditCardOutlined />,
      valueStyle: { color: "#52c41a", fontWeight: "bold" },
      suffix: "VNĐ",
    },
    {
      key: "remainingAmount",
      title: "Số tiền còn lại",
      value: formatCurrency(remainingAmount),
      prefix: <DollarOutlined />,
      valueStyle: { color: "#faad14" },
      suffix: "VNĐ",
    },
  ].filter(Boolean) as {
    key: string;
    title: string;
    value: string;
    prefix: React.ReactNode;
    valueStyle?: React.CSSProperties;
    suffix?: string;
  }[];

  const gridColsClass = paymentStats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  const handleSignContract = async () => {
    if (!contract?.id) {
      messageApi.error("Không tìm thấy thông tin hợp đồng");
      return;
    }

    setSigningContract(true);
    try {
      await orderService.signContract(contract.id);
      messageApi.success({
        content:
          "Ký hợp đồng thành công! Vui lòng thanh toán đặt cọc để tiếp tục.",
        duration: 5,
      });
      // Reload the page to reflect the updated contract status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error signing contract:", error);
      messageApi.error("Có lỗi xảy ra khi ký hợp đồng");
    } finally {
      setSigningContract(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!contract?.id) {
      messageApi.error("Không tìm thấy thông tin hợp đồng");
      return;
    }

    setPayingDeposit(true);
    try {
      const response = await orderService.payDeposit(contract.id);
      messageApi.success("Khởi tạo thanh toán đặt cọc thành công!");

      // Parse the gatewayResponse to get the checkoutUrl
      let checkoutUrl = null;
      if (response?.data?.gatewayResponse) {
        try {
          const gatewayData = JSON.parse(response.data.gatewayResponse);
          checkoutUrl = gatewayData.checkoutUrl;
        } catch (parseError) {
          console.error("Error parsing gatewayResponse:", parseError);
        }
      }

      // If we have a checkout URL, redirect to it
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
      } else {
        messageApi.info("Đang chuyển hướng đến trang thanh toán...");
        // Reload the page to reflect any status changes
        window.location.reload();
      }
    } catch (error) {
      console.error("Error paying deposit:", error);
      messageApi.error("Có lỗi xảy ra khi thanh toán đặt cọc");
    } finally {
      setPayingDeposit(false);
    }
  };

  const handlePayFullAmount = async () => {
    if (!contract?.id) {
      messageApi.error("Không tìm thấy thông tin hợp đồng");
      return;
    }

    setPayingFullAmount(true);
    try {
      const response = await orderService.payFullAmount(contract.id);
      messageApi.success("Khởi tạo thanh toán toàn bộ thành công!");

      // Parse the gatewayResponse to get the checkoutUrl
      let checkoutUrl = null;
      if (response?.data?.gatewayResponse) {
        try {
          const gatewayData = JSON.parse(response.data.gatewayResponse);
          checkoutUrl = gatewayData.checkoutUrl;
        } catch (parseError) {
          console.error("Error parsing gatewayResponse:", parseError);
        }
      }

      // If we have a checkout URL, redirect to it
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
      } else {
        messageApi.info("Đang chuyển hướng đến trang thanh toán...");
        // Reload the page to reflect any status changes
        window.location.reload();
      }
    } catch (error) {
      console.error("Error paying full amount:", error);
      messageApi.error("Có lỗi xảy ra khi thanh toán toàn bộ");
    } finally {
      setPayingFullAmount(false);
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <FileTextOutlined className="mr-2 text-blue-500" />
          <span>Thông tin hợp đồng</span>
        </div>
      }
      className="shadow-md mb-6 rounded-xl"
    >
      {contract ? (
        <>
        
          {contract.status === "PAID" && (
            <Alert
              message="Thanh toán hoàn tất"
              description="Cảm ơn bạn! Đơn hàng của bạn đã được thanh toán đầy đủ. Tài xế sẽ bắt đầu vận chuyển ngay."
              type="success"
              showIcon
              className="mt-4"
              style={{ 
                backgroundColor: "#f6ffed",
                borderColor: "#b7eb8f",
                borderRadius: "8px",
                marginBottom: "16px"
              }}
            />
          )}
          {/* Payment Summary */}
          {depositAmount !== undefined && (
            <div className="mb-6">
              <Alert
                message="Thông tin thanh toán"
                description={
                  <div
                    className={`mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 ${gridColsClass}`}
                  >
                    {paymentStats.map((stat) => (
                      <div
                        key={stat.key}
                        className="rounded-lg bg-white/70 p-4 shadow-sm"
                      >
                        <Statistic
                          title={stat.title}
                          value={stat.value}
                          prefix={stat.prefix}
                          suffix={stat.suffix}
                          valueStyle={stat.valueStyle}
                        />
                      </div>
                    ))}
                  </div>
                }
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
              />
            </div>
          )}

          <div className="mb-6 flex items-center gap-3">
            <FileProtectOutlined className="text-2xl text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết hợp đồng</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tên hợp đồng */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <FileTextOutlined className="text-blue-500" />
                <label className="text-sm font-medium text-gray-600">Tên hợp đồng</label>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {contract.contractName || <span className="text-gray-400">Chưa có thông tin</span>}
              </p>
            </div>

            {/* Ngày hiệu lực */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <CalendarOutlined className="text-green-500" />
                <label className="text-sm font-medium text-gray-600">Ngày hiệu lực</label>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {contract.effectiveDate || <span className="text-gray-400">Chưa có thông tin</span>}
              </p>
            </div>

            {/* Ngày hết hạn */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <CalendarOutlined className="text-red-500" />
                <label className="text-sm font-medium text-gray-600">Ngày hết hạn</label>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {contract.expirationDate || <span className="text-gray-400">Chưa có thông tin</span>}
              </p>
            </div>

            {/* Giá trị hợp đồng */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <DollarOutlined className="text-blue-600" />
                <label className="text-sm font-medium text-gray-600">Giá trị hợp đồng</label>
              </div>
              <p className="text-base font-semibold text-blue-600">
                {contract.totalValue || <span className="text-gray-400">Chưa có thông tin</span>}
              </p>
            </div>

            {/* Giá trị điều chỉnh */}
            {hasAdjustedValue && (
              <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-2 flex items-center gap-2">
                  <DollarOutlined className="text-purple-600" />
                  <label className="text-sm font-medium text-gray-600">Giá trị điều chỉnh</label>
                </div>
                <p className="text-base font-semibold text-purple-600">
                  {contract.adjustedValue}
                </p>
              </div>
            )}

            {/* Trạng thái */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <InfoCircleOutlined className="text-orange-500" />
                <label className="text-sm font-medium text-gray-600">Trạng thái</label>
              </div>
              <div>
                {contract.status ? (
                  <ContractStatusTag status={contract.status as ContractStatusEnum} />
                ) : (
                  <span className="text-gray-400">Chưa có thông tin</span>
                )}
              </div>
            </div>

            {/* Nhân viên phụ trách */}
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-2 flex items-center gap-2">
                <UserOutlined className="text-cyan-500" />
                <label className="text-sm font-medium text-gray-600">Nhân viên phụ trách</label>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {contract.staffName || <span className="text-gray-400">Chưa có thông tin</span>}
              </p>
            </div>
          </div>

          {/* Mô tả - Full width */}
          {contract.description && contract.description !== "N/A" && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <InfoCircleOutlined className="text-blue-500" />
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
              </div>
              <p className="whitespace-pre-wrap text-gray-800">
                {contract.description}
              </p>
            </div>
          )}

          {/* Chi tiết giá cả và thanh toán - Hiển thị khi hợp đồng đã ký */}
          {(contract.status === "CONTRACT_SIGNED" ||
            contract.status === "DEPOSITED" ||
            contract.status === "PAID") && (
            <>
              <Divider className="mt-6" />

              {loadingPriceDetails ? (
                <div className="flex justify-center items-center py-8">
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 36 }} spin />
                    }
                    tip="Đang tải thông tin giá cả..."
                  />
                </div>
              ) : priceDetails ? (
                <div className="border-l-4 border-green-500 pl-6 pr-4 py-2">
                  {/* Bảng tính tiền chi tiết theo từng loại xe */}
                  {priceDetails.steps && priceDetails.steps.length > 0 && (
                    <div className="mb-6">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 py-2 px-3 text-left">
                              Loại xe
                            </th>
                            <th className="border border-gray-300 py-2 px-3 text-center">
                              SL xe
                            </th>
                            <th className="border border-gray-300 py-2 px-3 text-center">
                              Khoảng cách
                            </th>
                            <th className="border border-gray-300 py-2 px-3 text-right">
                              Đơn giá (VNĐ/km)
                            </th>
                            <th className="border border-gray-300 py-2 px-3 text-center">
                              Km áp dụng
                            </th>
                            <th className="border border-gray-300 py-2 px-3 text-right">
                              Thành tiền (VNĐ)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Nhóm các steps theo vehicleRuleName
                            const groupedSteps: {
                              [key: string]: typeof priceDetails.steps;
                            } = {};
                            priceDetails.steps.forEach((step) => {
                              if (!groupedSteps[step.vehicleRuleName]) {
                                groupedSteps[step.vehicleRuleName] = [];
                              }
                              groupedSteps[step.vehicleRuleName].push(step);
                            });

                            return Object.entries(groupedSteps).map(
                              ([vehicleRuleName, steps]) =>
                                steps.map((step, index) => (
                                  <tr
                                    key={`${vehicleRuleName}-${index}`}
                                    className="hover:bg-gray-50"
                                  >
                                    {index === 0 && (
                                      <td
                                        className="border border-gray-300 py-2 px-3 font-semibold"
                                        rowSpan={steps.length}
                                      >
                                        {vehicleRuleName}
                                      </td>
                                    )}
                                    {index === 0 && (
                                      <td
                                        className="border border-gray-300 py-2 px-3 text-center"
                                        rowSpan={steps.length}
                                      >
                                        {step.numOfVehicles}
                                      </td>
                                    )}
                                    <td className="border border-gray-300 py-2 px-3 text-center">
                                      {step.distanceRange}
                                    </td>
                                    <td className="border border-gray-300 py-2 px-3 text-right">
                                      {step.unitPrice.toLocaleString("vi-VN")}
                                    </td>
                                    <td className="border border-gray-300 py-2 px-3 text-center">
                                      {step.appliedKm.toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 py-2 px-3 text-right font-semibold">
                                      {step.subtotal.toLocaleString("vi-VN")}
                                    </td>
                                  </tr>
                                ))
                            );
                          })()}
                        </tbody>
                      </table>
                      <div className="text-xs text-gray-500 mt-2 italic">
                        * Thành tiền = Đơn giá × Km áp dụng × Số lượng xe
                      </div>
                    </div>
                  )}

                  {/* Hiển thị summary từ backend nếu có */}
                  {priceDetails.summary && (
                    <div
                      className="mb-6 whitespace-pre-line text-sm leading-relaxed p-4 bg-gray-50 rounded border border-gray-200"
                      style={{ fontFamily: "monospace" }}
                    >
                      {priceDetails.summary}
                    </div>
                  )}

                  {/* Bảng tổng kết chi tiết */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {hasAdjustedValue ? (
                      <div>
                        <table className="w-full text-sm">
                          <tbody>
                            <tr>
                              <td className="py-2 px-4 text-sm text-gray-600">
                                Giá niêm yết:
                              </td>
                              <td className="py-2 px-4 text-right text-gray-600 line-through">
                                {priceDetails.finalTotal.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 text-sm font-medium">
                                Giá áp dụng (tổng):
                              </td>
                              <td className="py-2 px-4 text-right font-semibold">
                                {parseContractValue(
                                  contract.adjustedValue
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="text-xs text-gray-500 mt-2">
                          Lưu ý: Giá áp dụng là giá đã điều chỉnh cho hợp đồng
                          này.
                        </div>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 font-semibold">
                              Tổng tiền trước điều chỉnh:
                            </td>
                            <td className="py-2 px-4 text-right">
                              {priceDetails.totalBeforeAdjustment.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 font-semibold">
                              Phí phụ thu loại hàng:
                            </td>
                            <td className="py-2 px-4 text-right">
                              +
                              {priceDetails.categoryExtraFee.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 font-semibold">
                              Hệ số nhân loại hàng:
                            </td>
                            <td className="py-2 px-4 text-right">
                              x{priceDetails.categoryMultiplier}
                            </td>
                          </tr>
                          {priceDetails.promotionDiscount > 0 && (
                            <tr className="border-b border-gray-200">
                              <td className="py-2 px-4 font-semibold">
                                Giảm giá khuyến mãi:
                              </td>
                              <td className="py-2 px-4 text-right">
                                -
                                {priceDetails.promotionDiscount.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </td>
                            </tr>
                          )}
                          <tr className="border-t border-gray-200">
                            <td className="py-3 px-4 font-bold text-base">
                              TỔNG GIÁ TRỊ HỢP ĐỒNG:
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              {priceDetails.finalTotal.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ) : (
                <Alert
                  message="Chưa có thông tin chi tiết giá cả"
                  type="info"
                  showIcon
                />
              )}
            </>
          )}

          {/* Action Guidance */}
          {(contract.status === "CONTRACT_DRAFT" ||
            contract.status === "PENDING") && (
            <Alert
              message="Hướng dẫn"
              description="Vui lòng xem và ký hợp đồng để tiếp tục quá trình vận chuyển."
              type="warning"
              showIcon
              className="mt-4"
            />
          )}
          {(contract.status === "CONTRACT_SIGNED" ||
            contract.status === "UNPAID") &&
            depositAmount && (
              <Alert
                message="Bước tiếp theo"
                description={`Hợp đồng đã được ký thành công! Vui lòng thanh toán đặt cọc ${depositAmount.toLocaleString(
                  "vi-VN"
                )} VNĐ để chúng tôi bắt đầu xử lý đơn hàng.`}
                type="success"
                showIcon
                className="mt-4"
              />
            )}
          {contract.status === "DEPOSITED" &&
            orderStatus === "ASSIGNED_TO_DRIVER" && (
              <Alert
                message="Sẵn sàng vận chuyển"
                description="Đơn hàng đã được phân công cho tài xế. Vui lòng thanh toán số tiền còn lại để hoàn tất."
                type="info"
                showIcon
                className="mt-4"
              />
            )}

          {/* Các nút hành động cho customer */}
          <div className="mt-4 flex flex-wrap gap-3">
            {contract.attachFileUrl && contract.attachFileUrl !== "N/A" ? (
              <>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  href={contract.attachFileUrl}
                  target="_blank"
                  size="large"
                >
                  Xem chi tiết hợp đồng
                </Button>

                {/* Nút ký hợp đồng chỉ hiện khi có file và trạng thái phù hợp */}
                {(contract.status === "CONTRACT_DRAFT" ||
                  contract.status === "PENDING") && (
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={handleSignContract}
                    loading={signingContract}
                    size="large"
                    className="ml-3"
                  >
                    Ký hợp đồng
                  </Button>
                )}

                {/* Nút thanh toán đặt cọc chỉ hiện khi hợp đồng đã ký */}
                {(contract.status === "CONTRACT_SIGNED" ||
                  contract.status === "UNPAID") && (
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    onClick={handlePayDeposit}
                    loading={payingDeposit}
                    size="large"
                    className="bg-green-500 hover:bg-green-600 border-green-500"
                  >
                    {depositAmount
                      ? `Thanh Toán Đặt Cọc ${depositAmount.toLocaleString(
                          "vi-VN"
                        )} VNĐ`
                      : "Thanh Toán Đặt Cọc"}
                  </Button>
                )}

                {/* Nút thanh toán toàn bộ chỉ hiện khi contract status là DEPOSITED và order status là ASSIGNED_TO_DRIVER */}
                {contract.status === "DEPOSITED" &&
                  orderStatus === "ASSIGNED_TO_DRIVER" && (
                    <Button
                      type="primary"
                      icon={<CreditCardOutlined />}
                      onClick={handlePayFullAmount}
                      loading={payingFullAmount}
                      size="large"
                      className="ml-3"
                      style={{ backgroundColor: "#52c41a" }}
                    >
                      Thanh Toán Toàn Bộ {remainingAmount > 0 ? `${formatCurrency(remainingAmount)} VNĐ` : ''}
                    </Button>
                  )}
              </>
            ) : (
              <p className="text-gray-500">Chưa có file hợp đồng</p>
            )}
          </div>
        </>
      ) : (
        <Empty description="Chưa có thông tin hợp đồng" />
      )}
    </Card>
  );
};

export default ContractSection;
