# Truckie - Transportation Management System

Hệ thống quản lý vận tải với tính năng theo dõi đơn hàng theo thời gian thực qua GPS.

## Cài đặt

```bash
# Cài đặt các dependencies
npm install

# Khởi chạy môi trường development
npm run dev

# Build cho production
npm run build
```

## Cấu hình biến môi trường

Dự án sử dụng các biến môi trường để cấu hình. Bạn cần tạo file `.env` ở thư mục gốc của dự án với các biến sau:

### API Configuration
```
VITE_API_URL=https://api.truckie.com/v1
VITE_API_TIMEOUT=30000
```

### Authentication
```
VITE_AUTH_TOKEN_KEY=truckie_auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=truckie_refresh_token
```

### Map Configuration
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_MAP_DEFAULT_CENTER_LAT=10.762622
VITE_MAP_DEFAULT_CENTER_LNG=106.660172
VITE_MAP_DEFAULT_ZOOM=12
```

### App Configuration
```
VITE_APP_NAME=Truckie
VITE_APP_DESCRIPTION=Transportation Management System with Real-Time GPS Order Tracking
VITE_SUPPORT_EMAIL=support@truckie.com
VITE_SUPPORT_PHONE=02873005588
```

### Feature Flags
```
VITE_FEATURE_LIVE_TRACKING=true
VITE_FEATURE_NOTIFICATIONS=true
VITE_FEATURE_CHAT=false
```

## Cấu trúc dự án

```
src/
├── assets/         # Hình ảnh, fonts và các tài nguyên tĩnh
├── components/     # Các component dùng chung
│   └── layout/     # Layout components (Header, Footer, etc.)
├── config/         # Cấu hình ứng dụng và biến môi trường
├── context/        # React Context API
├── hooks/          # Custom React hooks
├── pages/          # Các trang của ứng dụng
├── routes/         # Cấu hình định tuyến
├── services/       # Các service gọi API
├── types/          # TypeScript type definitions
└── utils/          # Các hàm tiện ích
```

## Công nghệ sử dụng

- React
- TypeScript
- Ant Design
- Tailwind CSS
- Axios
- React Router
- Vite
