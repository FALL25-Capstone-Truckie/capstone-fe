import { AdminLayout } from "../../../components/layout";

const AdminDevices = () => {
  const devices = [
    {
      id: 1,
      deviceId: "GPS001",
      type: "GPS Tracker",
      vehicle: "30A-12345",
      status: "online",
      battery: "85%",
      lastUpdate: "2024-01-26 10:30",
      location: "Hà Nội",
    },
    {
      id: 2,
      deviceId: "GPS002",
      type: "GPS Tracker",
      vehicle: "29B-67890",
      status: "offline",
      battery: "12%",
      lastUpdate: "2024-01-25 18:45",
      location: "TP.HCM",
    },
    {
      id: 3,
      deviceId: "GPS003",
      type: "GPS Tracker",
      vehicle: "51F-11223",
      status: "online",
      battery: "92%",
      lastUpdate: "2024-01-26 10:29",
      location: "Đà Nẵng",
    },
    {
      id: 4,
      deviceId: "GPS004",
      type: "GPS Tracker",
      vehicle: "43T-33445",
      status: "warning",
      battery: "25%",
      lastUpdate: "2024-01-26 09:15",
      location: "Cần Thơ",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý thiết bị
            </h1>
            <p className="text-gray-600">Theo dõi và quản lý thiết bị GPS</p>
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
            Thêm thiết bị
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">45</div>
            <div className="text-blue-600 text-sm">Tổng thiết bị</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-800">38</div>
            <div className="text-green-600 text-sm">Đang hoạt động</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">5</div>
            <div className="text-yellow-600 text-sm">Cảnh báo pin</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-800">2</div>
            <div className="text-red-600 text-sm">Mất kết nối</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách thiết bị
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm thiết bị..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Tất cả trạng thái</option>
                <option>Online</option>
                <option>Offline</option>
                <option>Cảnh báo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe gắn kết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vị trí hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật cuối
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
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {device.deviceId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {device.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            parseInt(device.battery) > 50
                              ? "bg-green-500"
                              : parseInt(device.battery) > 25
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-900">
                          {device.battery}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.lastUpdate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          device.status === "online"
                            ? "bg-green-100 text-green-800"
                            : device.status === "offline"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {device.status === "online"
                          ? "Online"
                          : device.status === "offline"
                          ? "Offline"
                          : "Cảnh báo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Theo dõi
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Cài đặt
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Reset
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

export default AdminDevices;
