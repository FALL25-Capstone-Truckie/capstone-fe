import React from 'react';
import { Skeleton } from 'antd';

interface NotificationSkeletonProps {
  count?: number;
  showAvatar?: boolean;
}

const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ 
  count = 1, 
  showAvatar = true 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            {showAvatar && (
              <Skeleton.Avatar 
                size={48} 
                shape="circle" 
                active 
                className="flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton.Button 
                  size="small" 
                  style={{ width: 80 }} 
                  active 
                />
                <Skeleton.Button 
                  size="small" 
                  style={{ width: 60 }} 
                  active 
                />
              </div>
              <Skeleton.Button 
                size="small" 
                style={{ width: '70%' }} 
                active 
              />
              <Skeleton.Button 
                size="small" 
                style={{ width: '90%' }} 
                active 
              />
              <div className="flex items-center justify-between">
                <Skeleton.Button 
                  size="small" 
                  style={{ width: 100 }} 
                  active 
                />
                <Skeleton.Button 
                  size="small" 
                  style={{ width: 60 }} 
                  active 
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
