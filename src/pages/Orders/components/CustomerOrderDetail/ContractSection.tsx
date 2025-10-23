import React, { useState } from "react";
import { Card, Descriptions, Empty, Button, App } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import orderService from "../../../../services/order/orderService";
import { ContractStatusTag } from "../../../../components/common/tags";
import { ContractStatusEnum } from "../../../../constants/enums";

interface ContractProps {
  contract?: {
    id: string;
    contractName: string;
    effectiveDate: string;
    expirationDate: string;
    totalValue: string;
    supportedValue: string;
    description: string;
    attachFileUrl: string;
    status: string;
    staffName: string;
  };
  orderStatus?: string;
}

const ContractSection: React.FC<ContractProps> = ({ contract, orderStatus }) => {
  const messageApi = App.useApp().message;
  const [signingContract, setSigningContract] = useState<boolean>(false);
  const [payingDeposit, setPayingDeposit] = useState<boolean>(false);
  const [payingFullAmount, setPayingFullAmount] = useState<boolean>(false);

  const handleSignContract = async () => {
    if (!contract?.id) {
      messageApi.error("Không tìm thấy thông tin hợp đồng");
      return;
    }

    setSigningContract(true);
    try {
      await orderService.signContract(contract.id);
      messageApi.success("Ký hợp đồng thành công!");
      // Reload the page to reflect the updated contract status
      window.location.reload();
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
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
            <Descriptions.Item label="Tên hợp đồng">
              {contract.contractName || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiệu lực">
              {contract.effectiveDate || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {contract.expirationDate || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị hợp đồng">
              {contract.totalValue || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị hỗ trợ">
              {contract.supportedValue || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {contract.status ? (
                <ContractStatusTag status={contract.status as ContractStatusEnum} />
              ) : (
                "Chưa có thông tin"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên phụ trách">
              {contract.staffName || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={3}>
              {contract.description || "Không có mô tả"}
            </Descriptions.Item>
          </Descriptions>

          {/* Các nút hành động cho customer */}
          <div className="mt-4 space-x-3">
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
                    className="ml-3"
                  >
                    Thanh Toán Đặt Cọc
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
                      Thanh Toán Toàn Bộ
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
