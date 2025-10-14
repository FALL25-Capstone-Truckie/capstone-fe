import React from "react";
import {
  CustomerServiceOutlined,
  CarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { RoomType } from "@/models/Room";

type RoomTypeTab =
  | RoomType.SUPPORT
  | RoomType.ORDER_TYPE
  | RoomType.DRIVER_STAFF_ORDER;

interface SidebarProps {
  activeTab: RoomTypeTab;
  onTabChange: (tab: RoomTypeTab) => void;
}

const StaffChatSidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const getTabIcon = (tab: RoomTypeTab) => {
    switch (tab) {
      case "SUPPORT":
        return <CustomerServiceOutlined />;
      case "ORDER_TYPE":
        return <ShoppingCartOutlined />;
      case "DRIVER_STAFF_ORDER":
        return <CarOutlined />;
    }
  };

  const getTabLabel = (tab: RoomTypeTab) => {
    switch (tab) {
      case "SUPPORT":
        return "Hỗ trợ";
      case "ORDER_TYPE":
        return "Đơn hàng";
      case "DRIVER_STAFF_ORDER":
        return "Tài xế";
    }
  };

  return (
    <div className="w-16 bg-gray-50 border-r flex flex-col items-center py-4 gap-3">
      {(["SUPPORT", "ORDER_TYPE", "DRIVER_STAFF_ORDER"] as RoomTypeTab[]).map(
        (tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
              ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600 border border-blue-400 shadow-sm"
                  : "bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
              }`}
           title={getTabLabel(tab)}
              style={{
                backgroundColor: activeTab === tab ? "#E0F2FE" : "#FFFFFF",
              }}
          >
            <span className="text-2xl">{getTabIcon(tab)}</span>
          </button>
        )
      )}
    </div>
  );
};

export default StaffChatSidebar;
