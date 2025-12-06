import React, { useState } from 'react';
import {
  X,
  Package,
  ArrowLeft,
} from 'lucide-react';
import CustomerOverviewModal from './CustomerOverviewModal';
import OrderQuickViewModal from './OrderQuickViewModal';

interface UnifiedCustomerOrderModalProps {
  customerId: string;
  orderId?: string; // Optional - if provided, will show order details immediately
  onClose: () => void;
}

const UnifiedCustomerOrderModal: React.FC<UnifiedCustomerOrderModalProps> = ({ 
  customerId, 
  orderId: initialOrderId,
  onClose 
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId || null);

  // Handle order selection from customer overview
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Handle back to customer overview
  const handleBackToCustomer = () => {
    setSelectedOrderId(null);
  };

  // Handle close all
  const handleCloseAll = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop with 10% margin (5% on each side) */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleCloseAll} />
      <div className="fixed inset-[5%] flex z-50 rounded-lg overflow-hidden shadow-2xl">
        {/* Customer Overview Panel - 40% width on left */}
        <div className="bg-white shadow-xl w-[40%] h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Package size={18} />
              Thông tin khách hàng
            </h2>
            <button onClick={handleCloseAll} className="p-1 hover:bg-blue-500 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Customer Overview Content */}
          <div className="flex-1 overflow-hidden">
            <CustomerOverviewModal 
              customerId={customerId}
              onClose={handleCloseAll}
              onOrderSelect={handleOrderSelect}
              isEmbedded={true}
            />
          </div>
        </div>

        {/* Order Details Panel - 60% width on right */}
        {selectedOrderId ? (
          <OrderQuickViewModal
            orderId={selectedOrderId}
            onClose={handleBackToCustomer}
            onCloseAll={handleCloseAll}
            isSideBySide={true}
          />
        ) : (
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">Chọn một đơn hàng để xem chi tiết</p>
              <p className="text-sm mt-1">Nhấn vào đơn hàng ở bên trái để xem thông tin chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UnifiedCustomerOrderModal;
