import { AdminLayout } from "../../../../components/layout";

const AdminDrivers = () => {
  const drivers = [
    {
      id: 1,
      name: "Nguyễn Văn Tài",
      email: "nguyenvantai@email.com",
      phone: "0901234567",
      license: "B2-123456",
      vehicle: "30A-12345",
      status: "active",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Trần Minh Đức",
      email: "tranminhduc@email.com",
      phone: "0902345678",
      license: "C-234567",
      vehicle: "29B-67890",
      status: "busy",
      rating: 4.6,
    },
    {
      id: 3,
      name: "Lê Hoàng Nam",
      email: "lehoangnam@email.com",
      phone: "0903456789",
      license: "B2-345678",
      vehicle: "51F-11223",
      status: "offline",
      rating: 4.9,
    },
    {
      id: 4,
      name: "Phạm Thanh Sơn",
      email: "phamthanhson@email.com",
      phone: "0904567890",
      license: "C-456789",
      vehicle: "43T-33445",
      status: "active",
      rating: 4.7,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tài xế</h1>
            <p className="text-gray-600">Danh sách và thông tin tài xế</p>
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
            Thêm tài xế
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">15</div>
            <div className="text-green-600 text-sm">Đang hoạt động</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">8</div>
            <div className="text-yellow-600 text-sm">Đang bận</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-800">3</div>
            <div className="text-red-600 text-sm">Offline</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">26</div>
            <div className="text-blue-600 text-sm">Tổng tài xế</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách tài xế
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm tài xế..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Đang bận</option>
                <option>Offline</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài xế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bằng lái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe phụ trách
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
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
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {driver.name.split(" ").pop()?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {driver.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {driver.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.license}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-900">
                          {driver.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          driver.status === "active"
                            ? "bg-green-100 text-green-800"
                            : driver.status === "busy"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.status === "active"
                          ? "Hoạt động"
                          : driver.status === "busy"
                          ? "Đang bận"
                          : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Chi tiết
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Liên hệ
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

export default AdminDrivers;
