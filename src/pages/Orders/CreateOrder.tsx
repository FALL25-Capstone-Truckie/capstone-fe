import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Steps,
  Card,
  Typography,
  notification,
  Skeleton,
} from "antd";
import orderService from "../../services/order";
import categoryService from "../../services/category";
import addressService from "../../services/address";
import orderSizeService from "../../services/order-size";
import type { OrderCreateRequest } from "../../models/Order";
import type { Category } from "../../models/Category";
import type { Address } from "../../models/Address";
import type { OrderSize } from "../../models/OrderSize";
import { OrderDetailFormList } from "./components";
import { formatToVietnamTime } from "../../utils/dateUtils";
import {
  ReceiverInfoStep,
  AddressInfoStep,
  OrderSummaryStep,
  StepActions,
} from "./components/CreateOrderSteps";

const { Step } = Steps;
const { Title, Text } = Typography;

export default function CreateOrder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderSizes, setOrderSizes] = useState<OrderSize[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>();

  const [form] = Form.useForm();

  // Cập nhật giá trị form từ state khi component mount
  useEffect(() => {
    form.setFieldsValue(formValues);
  }, [form, formValues]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [addressesData, orderSizesData, categoriesData] =
          await Promise.all([
            addressService.getAllAddresses(),
            orderSizeService.getAllOrderSizes(),
            categoryService.getAllCategories(),
          ]);

        // Thêm trường fullAddress nếu chưa có
        const addressesWithFullAddress = addressesData.map((address) => ({
          ...address,
          fullAddress:
            address.fullAddress ||
            `${address.street}, ${address.ward}, ${address.province}`,
        }));

        setAddresses(addressesWithFullAddress);
        setOrderSizes(orderSizesData);
        setCategories(categoriesData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu");
        notification.error({
          message: "Lỗi",
          description: "Không thể tải dữ liệu cần thiết. Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: any) => {
    // Kết hợp giá trị từ form và state
    const finalValues = {
      ...formValues,
      ...values,
    };

    try {
      setIsSubmitting(true);

      // Xử lý orderDetailsList - lấy item đầu tiên để tạo đơn hàng chính
      // (Tùy theo API có hỗ trợ multiple OrderDetails hay không)
      const orderDetails = finalValues.orderDetailsList || [];
      if (orderDetails.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một gói hàng!");
      }

      // Chuẩn bị orderDetails cho API với xử lý số lượng
      const orderDetailsForAPI: any[] = [];

      orderDetails.forEach((detail: any) => {
        const quantity = detail.quantity || 1;

        // Tạo nhiều bản sao dựa trên số lượng
        for (let i = 0; i < quantity; i++) {
          orderDetailsForAPI.push({
            weight: detail.weight,
            unit: detail.unit,
            description: detail.description,
            orderSizeId: detail.orderSizeId,
          });
        }
      });

      // Xử lý estimateStartTime - format theo UTC+7 định dạng YYYY-MM-DDTHH:mm:ss
      const estimateStartTime = finalValues.estimateStartTime
        ? formatToVietnamTime(finalValues.estimateStartTime.toDate())
        : undefined;

      // Prepare data for API theo cấu trúc mới
      const orderData: OrderCreateRequest = {
        orderRequest: {
          notes: finalValues.notes,
          receiverName: finalValues.receiverName,
          receiverPhone: finalValues.receiverPhone,
          receiverIdentity: finalValues.receiverIdentity,
          packageDescription: finalValues.packageDescription,
          estimateStartTime: estimateStartTime,
          deliveryAddressId: finalValues.deliveryAddressId,
          pickupAddressId: finalValues.pickupAddressId,
          categoryId: finalValues.categoryId,
        },
        orderDetails: orderDetailsForAPI,
      };

      console.log("Submitting order data:", orderData);

      // Call API to create order
      const response = await orderService.createOrder(orderData);

      notification.success({
        message: "Đặt hàng thành công",
        description: `Đơn hàng của bạn đã được tạo thành công với mã ${response.orderCode}.`,
      });

      // Redirect to order list page
      navigate("/orders");
    } catch (err: any) {
      notification.error({
        message: "Đặt hàng thất bại",
        description:
          err.message ||
          "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate form fields in current step
  const validateForm = async () => {
    try {
      let fieldsToValidate: string[] = [];

      switch (currentStep) {
        case 0:
          fieldsToValidate = [
            "receiverName",
            "receiverPhone",
            "categoryId",
            "packageDescription",
          ];
          break;
        case 1:
          fieldsToValidate = ["weight", "orderSizeId", "description"];
          break;
        case 2:
          fieldsToValidate = ["pickupAddressId", "deliveryAddressId", "notes"];
          break;
        default:
          fieldsToValidate = [];
      }

      await form.validateFields(fieldsToValidate);
      return true;
    } catch (errorInfo) {
      console.log("Failed form validation:", errorInfo);
      return false;
    }
  };

  // Move to next step
  const next = () => {
    validateForm().then((isValid) => {
      if (isValid) {
        // Save current step form values
        const values = form.getFieldsValue();
        setFormValues((prev: any) => ({
          ...prev,
          ...values,
        }));

        setCurrentStep(currentStep + 1);
      }
    });
  };

  // Move to previous step
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render form based on current step
  const renderForm = () => {
    if (loading) {
      return (
        <div className="py-12">
          <div className="text-center mb-6">
            <Skeleton.Input active size="large" style={{ width: "300px" }} />
            <div className="mt-3">
              <Skeleton.Input active size="small" style={{ width: "400px" }} />
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton.Button
              active
              size="large"
              shape="round"
              style={{ width: "100%", height: "48px" }}
            />
            <Skeleton active paragraph={{ rows: 6 }} />
            <div className="flex justify-between items-center pt-6">
              <Skeleton.Button
                active
                size="large"
                shape="round"
                style={{ width: "100px" }}
              />
              <Skeleton.Button
                active
                size="large"
                shape="round"
                style={{ width: "100px" }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <Title level={4} className="text-red-600 mb-3">
                Đã xảy ra lỗi
              </Title>
              <Text className="text-red-500 block mb-6">{error}</Text>
              <Button
                type="primary"
                size="large"
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 border-red-500"
              >
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return <ReceiverInfoStep categories={categories} />;
      case 1:
        return (
          <OrderDetailFormList
            name="orderDetailsList"
            label="Danh sách gói hàng"
            orderSizes={orderSizes}
          />
        );
      case 2:
        return <AddressInfoStep addresses={addresses} />;
      case 3:
        return (
          <OrderSummaryStep
            formValues={formValues}
            categories={categories}
            orderSizes={orderSizes}
            addresses={addresses}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Title level={2} className="mb-2">
              Tạo đơn hàng mới
            </Title>
            <Text className="text-gray-600">
              Điền thông tin chi tiết để tạo đơn hàng vận chuyển
            </Text>
          </div>
          <Link to="/orders">
            <Button type="default" size="large" className="shrink-0">
              ← Quay lại danh sách
            </Button>
          </Link>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          {/* Steps Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
            <Steps current={currentStep} className="mb-0">
              <Step
                title="Thông tin cơ bản"
                //description="Nhập thông tin người nhận"
              />
              <Step
                title="Thông tin lô hàng"
                //description="Nhập thông tin gói hàng"
              />
              <Step
                title="Địa chỉ vận chuyển"
                //description="Chọn địa chỉ giao và nhận"
              />
              <Step
                title="Xác nhận"
                //description="Xác nhận thông tin đơn hàng"
              />
            </Steps>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={formValues}
            >
              {renderForm()}

              <StepActions
                currentStep={currentStep}
                totalSteps={4}
                onPrev={prev}
                onNext={next}
                onSubmit={() => form.submit()}
                isSubmitting={isSubmitting}
              />
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
