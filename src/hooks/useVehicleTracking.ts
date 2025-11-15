import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import authService from '../services/auth/authService';
import VehicleLocationCache from '../utils/vehicleLocationCache';
import { API_BASE_URL } from '../config/env';

// Định nghĩa interface cho dữ liệu vị trí xe
export interface VehicleLocationMessage {
  vehicleId: string;
  latitude: number | null;
  longitude: number | null;
  licensePlateNumber: string;
  manufacturer: string;
  vehicleTypeName: string;
  vehicleAssignmentId: string;
  trackingCode: string;
  orderDetailStatus: string;
  driver1Name: string | null;
  driver1Phone: string | null;
  driver2Name: string | null;
  driver2Phone: string | null;
  lastUpdated: string | null;
  bearing: number | null;
  speed: number | null;
  velocityLat: number | null;
  velocityLng: number | null;
}

export interface UseVehicleTrackingOptions {
  orderId?: string;
  vehicleId?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseVehicleTrackingReturn {
  vehicleLocations: VehicleLocationMessage[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const DEFAULT_OPTIONS: Required<UseVehicleTrackingOptions> = {
  orderId: '',
  vehicleId: '',
  autoConnect: false,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
};

export const useVehicleTracking = (options: UseVehicleTrackingOptions = {}): UseVehicleTrackingReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Cache instance để lưu trữ vị trí cuối cùng của vehicle
  const cacheRef = useRef(VehicleLocationCache.getInstance());
  
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const subscriptionsRef = useRef<any[]>([]);
  const initialDataRequestedRef = useRef(false);
  const retryInitialDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vehicleLocationsRef = useRef<VehicleLocationMessage[]>([]);

  // Error logging function
  const logError = useCallback((message: string, error?: any) => {
    console.error(`[VehicleTracking] ${message}`, error || '');
  }, []);

  // Clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Request initial data helper
  const requestInitialData = useCallback(() => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

    if (config.orderId) {
      console.log(`📤 Requesting initial locations for order ${config.orderId}`);
      client.publish({
        destination: `/app/order/${config.orderId}/get-locations`,
        body: JSON.stringify({ orderId: config.orderId }),
      });
      initialDataRequestedRef.current = true;
    } else if (config.vehicleId) {
      console.log(`📤 Requesting initial location for vehicle ${config.vehicleId}`);
      client.publish({
        destination: `/app/vehicle/${config.vehicleId}/get-location`,
        body: JSON.stringify({ vehicleId: config.vehicleId }),
      });
      initialDataRequestedRef.current = true;
    }
  }, [config.orderId, config.vehicleId]);

  // Handle incoming vehicle location messages với cache fallback
  const handleVehicleLocationMessage = useCallback((message: IMessage) => {
    try {
      const locationData: VehicleLocationMessage | VehicleLocationMessage[] = JSON.parse(message.body);
      
      let incomingVehicles: VehicleLocationMessage[];
      
      if (Array.isArray(locationData)) {
        // CRITICAL: Deduplicate vehicles by vehicleId to prevent React key conflicts
        incomingVehicles = locationData.reduce((acc, vehicle) => {
          if (!acc.some(v => v.vehicleId === vehicle.vehicleId)) {
            acc.push(vehicle);
          }
          return acc;
        }, [] as VehicleLocationMessage[]);
        
        if (incomingVehicles.length !== locationData.length) {
          console.warn(`[VehicleTracking] Deduplicated ${locationData.length - incomingVehicles.length} duplicate vehicle(s)`);
        }
      } else {
        incomingVehicles = [locationData];
      }
      
      // Merge với cache để đảm bảo markers không bao giờ bị mất
      const mergedVehicles = cacheRef.current.mergeWithWebSocketData(incomingVehicles);
      
      // Cập nhật state với merged data
      setVehicleLocations(mergedVehicles);
      vehicleLocationsRef.current = mergedVehicles;
      
      console.log(`📍 [VehicleTracking] Updated ${mergedVehicles.length} vehicles (${incomingVehicles.length} from WebSocket, merged with cache)`);
      
      setError(null);
    } catch (err) {
      logError('Failed to parse vehicle location message:', err);
      setError('Lỗi khi xử lý dữ liệu vị trí xe');
      
      // Trong trường hợp lỗi, vẫn hiển thị dữ liệu từ cache
      const cachedVehicles = cacheRef.current.getAllVehicleLocations();
      if (cachedVehicles.length > 0) {
        setVehicleLocations(cachedVehicles);
        vehicleLocationsRef.current = cachedVehicles;
        console.log(`📍 [VehicleTracking] Fallback to ${cachedVehicles.length} cached vehicles`);
      }
    }
  }, [logError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (clientRef.current?.connected || isConnecting) {
      return;
    }

    const token = authService.getAuthToken();
    if (!token) {
      logError('No auth token available');
      setError('Không có token xác thực');
      return;
    }

    if (!config.orderId && !config.vehicleId) {
      logError('Neither orderId nor vehicleId provided');
      setError('Cần cung cấp orderId hoặc vehicleId');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    // Tự động tắt trạng thái connecting sau 3 giây để cải thiện UX
    // Nếu có cached data, user sẽ thấy markers ngay lập tức
    connectingTimeoutRef.current = setTimeout(() => {
      if (isConnecting) {
        setIsConnecting(false);
        console.log('[VehicleTracking] ⏰ Connecting timeout - switching to show cached data');
      }
    }, 3000);

    // Create STOMP client with SockJS transport
    const client = new Client({
      // Use SockJS instead of raw WebSocket
      webSocketFactory: () => {
        return new SockJS(`${API_BASE_URL}/vehicle-tracking-browser`);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (_str) => {
      },
      reconnectDelay: config.reconnectInterval,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Connection success handler
    client.onConnect = () => {
      // Clear connecting timeout khi kết nối thành công
      if (connectingTimeoutRef.current) {
        clearTimeout(connectingTimeoutRef.current);
        connectingTimeoutRef.current = null;
      }
      
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      reconnectAttemptsRef.current = 0;

      try {
        // Subscribe to appropriate topic based on configuration
        // PRIORITY: vehicleId over orderId to avoid conflicts
        if (config.vehicleId) {
          const topicPath = `/topic/vehicles/${config.vehicleId}`;
          console.log(`🔗 Subscribing to vehicle location: ${topicPath}`);
          
          const subscription = client.subscribe(
            topicPath,
            (message) => {
              console.log(`📍 WEBSOCKET: Received location for vehicle ${config.vehicleId}`);
              handleVehicleLocationMessage(message);
            }
          );
          subscriptionsRef.current.push(subscription);

          // Request initial location after subscription
          setTimeout(() => {
            requestInitialData();
            
            // Retry if no data received after 3 seconds
            retryInitialDataTimeoutRef.current = setTimeout(() => {
              if (vehicleLocationsRef.current.length === 0) {
                console.log(`⚠️ No initial data received, retrying...`);
                requestInitialData();
              }
            }, 3000);
          }, 1000);
        } else if (config.orderId) {
          const topicPath = `/topic/orders/${config.orderId}/vehicles`;
          console.log(`🔗 Subscribing to order vehicles: ${topicPath}`);
          
          const subscription = client.subscribe(
            topicPath,
            (message) => {
              console.log(`📍 Received order vehicles update (RAW):`, message.body);
              try {
                const parsed = JSON.parse(message.body);
                console.log(`📍 Received order vehicles update (PARSED):`, parsed);
              } catch (e) {
                console.error('Failed to parse message:', e);
              }
              handleVehicleLocationMessage(message);
            }
          );
          subscriptionsRef.current.push(subscription);

          // Request initial locations for all vehicles in order
          setTimeout(() => {
            requestInitialData();
            
            // Retry if no data received after 3 seconds
            retryInitialDataTimeoutRef.current = setTimeout(() => {
              if (vehicleLocationsRef.current.length === 0) {
                console.log(`⚠️ No initial data received for order, retrying...`);
                requestInitialData();
              }
            }, 3000);
          }, 1000);
        }
      } catch (error) {
        logError('Error subscribing to topics:', error);
        setError('Lỗi khi đăng ký nhận thông tin vị trí');
      }
    };

    // Connection error handler
    client.onStompError = (frame) => {
      // Clear connecting timeout khi có lỗi
      if (connectingTimeoutRef.current) {
        clearTimeout(connectingTimeoutRef.current);
        connectingTimeoutRef.current = null;
      }
      
      logError('STOMP Error:', frame);
      setIsConnected(false);
      setIsConnecting(false);
      setError(`Lỗi kết nối WebSocket: ${frame.headers['message'] || 'Lỗi không xác định'}`);
      
      // Clear any existing subscriptions
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          // Ignore unsubscribe errors
        }
      });
      subscriptionsRef.current = [];
      
      // Attempt reconnection if not exceeded max attempts
      if (reconnectAttemptsRef.current < config.maxReconnectAttempts) {
        scheduleReconnect();
      } else {
        setError('Không thể kết nối tới server sau nhiều lần thử. Vui lòng kiểm tra kết nối internet.');
      }
    };

    // WebSocket error handler
    client.onWebSocketError = (event) => {
      logError('WebSocket Error:', event);
      setIsConnected(false);
      setIsConnecting(false);
      setError('Mất kết nối tới server. Đang thử kết nối lại...');
      
      // Clear subscriptions
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          // Ignore unsubscribe errors
        }
      });
      subscriptionsRef.current = [];
      
      if (reconnectAttemptsRef.current < config.maxReconnectAttempts) {
        scheduleReconnect();
      } else {
        setError('Không thể kết nối tới server. Vui lòng làm mới trang.');
      }
    };

    // WebSocket closed handler
    client.onWebSocketClose = (event) => {
      logError('WebSocket Closed:', event);
      setIsConnected(false);
      setIsConnecting(false);
      
      // Only show error if it wasn't a normal closure
      if (event.code !== 1000) {
        setError('Kết nối bị ngắt. Đang thử kết nối lại...');
      }
      
      // Clear subscriptions
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          // Ignore unsubscribe errors
        }
      });
      subscriptionsRef.current = [];
      
      if (reconnectAttemptsRef.current < config.maxReconnectAttempts) {
        scheduleReconnect();
      } else {
        setError('Không thể duy trì kết nối. Vui lòng làm mới trang.');
      }
    };

    // Disconnection handler
    client.onDisconnect = (receipt) => {
      logError('Client Disconnected:', receipt);
      setIsConnected(false);
      setIsConnecting(false);
      
      // Clear subscriptions
      subscriptionsRef.current.forEach(subscription => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          // Ignore unsubscribe errors
        }
      });
      subscriptionsRef.current = [];
      
      // Only attempt reconnection if not manually disconnected
      if (reconnectAttemptsRef.current < config.maxReconnectAttempts) {
        scheduleReconnect();
      }
    };

    // Store client reference
    clientRef.current = client;

    // Activate the connection
    client.activate();
  }, [config.orderId, config.vehicleId, config.reconnectInterval, logError, handleVehicleLocationMessage, requestInitialData]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current += 1;
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (reconnectAttemptsRef.current <= config.maxReconnectAttempts) {
        connect();
      } else {
        setError('Không thể kết nối lại sau nhiều lần thử');
      }
    }, config.reconnectInterval);
  }, [config.maxReconnectAttempts, config.reconnectInterval, connect, logError, clearReconnectTimeout]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    
    // Clear retry timeout
    if (retryInitialDataTimeoutRef.current) {
      clearTimeout(retryInitialDataTimeoutRef.current);
      retryInitialDataTimeoutRef.current = null;
    }
    
    reconnectAttemptsRef.current = config.maxReconnectAttempts; // Prevent auto-reconnection
    
    // Unsubscribe from all topics
    subscriptionsRef.current.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (err) {
      }
    });
    subscriptionsRef.current = [];
    
    // Deactivate client
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    // DON'T clear vehicleLocations - keep last known positions for user reference
    // Khi disconnect, đảm bảo vẫn hiển thị dữ liệu từ cache
    const cachedVehicles = cacheRef.current.getAllVehicleLocations();
    if (cachedVehicles.length > 0) {
      setVehicleLocations(cachedVehicles);
      vehicleLocationsRef.current = cachedVehicles;
      console.log(`📍 [VehicleTracking] Disconnect - showing ${cachedVehicles.length} cached vehicles`);
    }
    setError(null);
  }, [config.maxReconnectAttempts, logError, clearReconnectTimeout]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0; // Reset attempts
    disconnect();
    setTimeout(() => connect(), 1000); // Wait a bit before reconnecting
  }, [connect, disconnect]);

  // Load cached vehicles on mount trước khi kết nối WebSocket
  useEffect(() => {
    // Load dữ liệu từ cache ngay lập tức để hiển thị markers
    const cachedVehicles = cacheRef.current.getAllVehicleLocations();
    if (cachedVehicles.length > 0) {
      setVehicleLocations(cachedVehicles);
      vehicleLocationsRef.current = cachedVehicles;
      console.log(`📍 [VehicleTracking] Loaded ${cachedVehicles.length} vehicles from cache on mount`);
    }
  }, []);
  
  // Auto-connect on mount if enabled
  useEffect(() => {
    if (config.autoConnect && (config.orderId || config.vehicleId)) {
      connect();
    }

    // Cleanup on unmount
    return () => {  
      disconnect();
    };
  }, [config.autoConnect, config.orderId, config.vehicleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reconnect when orderId or vehicleId changes
  useEffect(() => {
    if (isConnected && (config.orderId || config.vehicleId)) {
      reconnect();
    }
  }, [config.orderId, config.vehicleId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    vehicleLocations,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    reconnect,
  };
};

export default useVehicleTracking;