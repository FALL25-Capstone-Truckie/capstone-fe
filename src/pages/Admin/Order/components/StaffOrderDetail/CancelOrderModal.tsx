import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Typography, Alert, Spin, Input } from "antd";
import { ExclamationCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import orderService from "../../../../../services/order/orderService";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CancelOrderModalProps {
  visible: boolean;
  orderCode: string;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for staff to cancel an order with a reason
 * Only available for orders with status PROCESSING
 */
const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  orderCode,
  orderId,
  onClose,
  onSuccess,
}) => {
  const [cancellationReasons, setCancellationReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | undefined>(undefined);
  const [customReason, setCustomReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cancellation reasons when modal opens
  useEffect(() => {
    if (visible) {
      fetchCancellationReasons();
      // Reset state when modal opens
      setSelectedReason(undefined);
      setCustomReason("");
      setError(null);
    }
  }, [visible]);

  const fetchCancellationReasons = async () => {
    setLoadingReasons(true);
    try {
      const reasons = await orderService.getStaffCancellationReasons();
      setCancellationReasons(reasons);
    } catch (err) {
      console.error("Failed to fetch cancellation reasons:", err);
      setError("Không thể tải danh sách lý do hủy. Vui lòng thử lại.");
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedReason) {
      setError("Vui lòng chọn lý do hủy đơn hàng");
      return;
    }

    // If "Khác" is selected, validate custom reason
    const finalReason = selectedReason === "Khác" ? customReason.trim() : selectedReason;
    
    if (!finalReason) {
      setError("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    if (selectedReason === "Khác" && customReason.trim().length < 10) {
      setError("Lý do hủy phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await orderService.staffCancelOrder(orderId, finalReason);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setError(err?.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-600">
          <ExclamationCircleOutlined className="text-xl" />
          <span>Xác nhận hủy đơn hàng</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <div className="py-4">
        <Alert
          message="Lưu ý quan trọng"
          description={
            <div>
              <Paragraph className="mb-2">
                Bạn đang thực hiện hủy đơn hàng <Text strong>{orderCode}</Text>.
              </Paragraph>
              <Paragraph className="mb-0">
                Sau khi hủy, khách hàng sẽ nhận được thông báo và email về việc đơn hàng bị hủy kèm lý do.
                Mọi thắc mắc khách hàng có thể liên hệ qua các thông tin liên hệ của công ty.
              </Paragraph>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />

        <div className="mb-4">
          <Text strong className="block mb-2">
            Chọn lý do hủy đơn hàng <Text type="danger">*</Text>
          </Text>
          {loadingReasons ? (
            <div className="flex items-center justify-center py-4">
              <Spin size="small" />
              <Text className="ml-2">Đang tải danh sách lý do...</Text>
            </div>
          ) : (
            <Select
              placeholder="Chọn lý do hủy"
              value={selectedReason}
              onChange={(value) => {
                setSelectedReason(value);
                setCustomReason("");
                setError(null);
              }}
              className="w-full"
              size="large"
              status={error && !selectedReason ? "error" : undefined}
            >
              {cancellationReasons.map((reason, index) => (
                <Select.Option key={index} value={reason}>
                  {reason}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>

        {/* Show custom reason input when "Khác" is selected */}
        {selectedReason === "Khác" && (
          <div className="mb-4">
            <Text strong className="block mb-2">
              Nhập lý do hủy đơn hàng <Text type="danger">*</Text>
            </Text>
            <TextArea
              placeholder="Vui lòng nhập lý do hủy đơn hàng chi tiết (ít nhất 10 ký tự)"
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                setError(null);
              }}
              className="w-full"
              rows={3}
              maxLength={500}
              showCount
              status={error && selectedReason === "Khác" && customReason.trim().length < 10 ? "error" : undefined}
            />
            <Text type="secondary" className="text-xs mt-1 block">
              Tối thiểu 10 ký tự, tối đa 500 ký tự
            </Text>
          </div>
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            disabled={loading}
            size="large"
          >
            Đóng
          </Button>
          <Button
            type="primary"
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleCancel}
            loading={loading}
            disabled={!selectedReason || loadingReasons || (selectedReason === "Khác" && customReason.trim().length < 10)}
            size="large"
          >
            Xác nhận hủy đơn
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
