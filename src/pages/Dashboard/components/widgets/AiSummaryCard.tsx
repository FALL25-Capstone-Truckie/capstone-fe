import React from 'react';
import { Card, Typography } from 'antd';
import { RobotOutlined, BulbOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AiSummaryCardProps {
  summary: string;
  loading?: boolean;
}

/**
 * Parse simple markdown bold (**text**) to React elements
 */
const parseMarkdown = (text: string): React.ReactNode => {
  if (!text) return 'Đang phân tích dữ liệu...';
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index} className="text-blue-700 font-semibold">{content}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

/**
 * Animated loading dots component
 */
const LoadingDots: React.FC = () => {
  return (
    <span className="inline-flex">
      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
    </span>
  );
};

const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ summary, loading }) => {
  return (
    <Card 
      className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow"
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <RobotOutlined className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BulbOutlined className="text-blue-600" />
            <Text strong className="text-blue-800">Tóm tắt AI</Text>
          </div>
          <div className="text-gray-700 leading-relaxed">
            {loading ? (
              <div className="flex items-center gap-1">
                <span>Đang phân tích</span>
                <LoadingDots />
              </div>
            ) : (
              parseMarkdown(summary)
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AiSummaryCard;
