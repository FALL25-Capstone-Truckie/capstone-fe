import { AdminLayout } from "../../../components/layout";

const AdminVehicles = () => {
  const vehicles = [
    {
      id: 1,
      licensePlate: "30A-12345",
      type: "Xe tải nhỏ",
      driver: "Nguyễn Văn Tài",
      capacity: "1.5 tấn",
      status: "active",
      lastMaintenance: "2024-01-15",
    },
    {
      id: 2,
      licensePlate: "29B-67890",
      type: "Xe tải trung",
      driver: "Trần Minh Đức",
      capacity: "3.5 tấn",
      status: "maintenance",
      lastMaintenance: "2024-01-10",
    },
    {
      id: 3,
      licensePlate: "51F-11223",
      type: "Xe tải lớn",
      driver: "Lê Hoàng Nam",
      capacity: "7 tấn",
      status: "active",
      lastMaintenance: "2024-01-20",
    },
    {
      id: 4,
      licensePlate: "43T-33445",
      type: "Xe tải nhỏ",
      driver: "Phạm Thanh Sơn",
      capacity: "2 tấn",
      status: "inactive",
      lastMaintenance: "2024-01-05",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý xe</h1>
            <p className="text-gray-600">Danh sách và thông tin xe tải</p>
          </div>
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
            Đăng ký xe mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">45</div>
            <div className="text-blue-600 text-sm">Tổng số xe</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">38</div>
            <div className="text-green-600 text-sm">Đang hoạt động</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">5</div>
            <div className="text-yellow-600 text-sm">Đang bảo trì</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-800">2</div>
            <div className="text-red-600 text-sm">Ngừng hoạt động</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách xe
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm theo biển số..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả loại xe</option>
                <option>Xe tải nhỏ</option>
                <option>Xe tải trung</option>
                <option>Xe tải lớn</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Bảo trì</option>
                <option>Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài xế phụ trách
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tải trọng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bảo trì gần nhất
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
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 5v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.licensePlate}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.lastMaintenance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vehicle.status === "active"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.status === "active"
                          ? "Hoạt động"
                          : vehicle.status === "maintenance"
                          ? "Bảo trì"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Chi tiết
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Bảo trì
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Khóa
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

export default AdminVehicles;
