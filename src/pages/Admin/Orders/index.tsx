import { AdminLayout } from "../../../components/layout";

const AdminOrders = () => {
  const orders = [
    {
      id: 1,
      orderId: "#ORD001",
      customer: "Nguyễn Văn A",
      driver: "Trần Văn Tài",
      pickup: "Hà Nội",
      delivery: "TP.HCM",
      status: "completed",
      value: "150,000₫",
      date: "2024-01-26",
    },
    {
      id: 2,
      orderId: "#ORD002",
      customer: "Lê Thị B",
      driver: "Phạm Minh Đức",
      pickup: "Đà Nẵng",
      delivery: "Hải Phòng",
      status: "in_transit",
      value: "200,000₫",
      date: "2024-01-26",
    },
    {
      id: 3,
      orderId: "#ORD003",
      customer: "Hoàng Văn C",
      driver: "Vũ Thị E",
      pickup: "TP.HCM",
      delivery: "Cần Thơ",
      status: "pickup",
      value: "180,000₫",
      date: "2024-01-26",
    },
    {
      id: 4,
      orderId: "#ORD004",
      customer: "Đỗ Thị D",
      driver: "Mai Văn F",
      pickup: "Hải Phòng",
      delivery: "Quảng Ninh",
      status: "pending",
      value: "120,000₫",
      date: "2024-01-26",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý đơn hàng
            </h1>
            <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              Xuất báo cáo
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Tạo đơn hàng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">156</div>
            <div className="text-blue-600 text-sm">Tổng đơn hàng</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">23</div>
            <div className="text-yellow-600 text-sm">Chờ xử lý</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">45</div>
            <div className="text-purple-600 text-sm">Đang lấy hàng</div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">67</div>
            <div className="text-orange-600 text-sm">Đang giao</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">89</div>
            <div className="text-green-600 text-sm">Hoàn thành</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng
            </h3>
            <div className="flex gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả trạng thái</option>
                <option>Chờ xử lý</option>
                <option>Đang lấy hàng</option>
                <option>Đang giao</option>
                <option>Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài xế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.pickup}
                      </div>
                      <div className="text-xs text-gray-500">
                        → {order.delivery}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "in_transit"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "pickup"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Hoàn thành"
                          : order.status === "in_transit"
                          ? "Đang giao"
                          : order.status === "pickup"
                          ? "Đang lấy hàng"
                          : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Chi tiết
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Theo dõi
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
