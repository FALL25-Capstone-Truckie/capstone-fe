import React, { useState } from 'react';
import { Upload, Button, message, Image, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

import type { RcFile } from 'antd/es/upload';

interface ImageUploadProps {
  value?: RcFile[];
  onChange?: (files: RcFile[]) => void;
  maxCount?: number;
  title?: string;
  description?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 10,
  title = 'Tải lên hình ảnh',
  description = 'Hỗ trợ định dạng JPG, PNG. Tối đa 10MB mỗi ảnh.'
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = (file: UploadFile) => {
    if (file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj);
      setPreviewImage(url);
      setPreviewOpen(true);
    }
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    // Convert UploadFile[] to RcFile[]
    const files = fileList
      .map(file => file.originFileObj)
      .filter((file): file is RcFile => file !== undefined);

    onChange?.(files);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ hỗ trợ file JPG/PNG!');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
      return false;
    }
    return false; // Prevent automatic upload
  };

  const customRequest = ({ onSuccess }: any) => {
    onSuccess?.();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 500 }}>{title}</span>
        {description && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {description}
          </div>
        )}
      </div>
      
      <Upload
        listType="picture-card"
        fileList={value.map((file, index) => ({
          uid: `${index}-${file.name}`,
          name: file.name,
          status: 'done' as const,
          url: URL.createObjectURL(file),
          originFileObj: file as RcFile
        }))}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        maxCount={maxCount}
      >
        {value.length >= maxCount ? null : uploadButton}
      </Upload>

      {previewImage && (
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            src: previewImage,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
        />
      )}
    </div>
  );
};

export default ImageUpload;
