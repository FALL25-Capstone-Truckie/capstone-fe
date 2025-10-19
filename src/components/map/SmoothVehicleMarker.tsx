import React, { useEffect, useRef, useCallback } from 'react';
import type { VehicleLocationMessage } from '../../hooks/useVehicleTracking';

interface SmoothVehicleMarkerProps {
  vehicle: VehicleLocationMessage;
  map: any;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onMarkerClick?: (vehicle: VehicleLocationMessage) => void;
}

interface InterpolationState {
  startLat: number;
  startLng: number;
  targetLat: number;
  targetLng: number;
  startTime: number;
  duration: number;
  velocityLat: number;
  velocityLng: number;
}

const SmoothVehicleMarker: React.FC<SmoothVehicleMarkerProps> = ({
  vehicle,
  map,
  isSelected = false,
  isHighlighted = false,
  onMarkerClick
}) => {
  const markerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const interpolationStateRef = useRef<InterpolationState | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);


  // Initialize marker
  useEffect(() => {
    if (!map || !vehicle || !window.vietmapgl) return;
    if (markerRef.current) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background-color: ${isSelected ? '#52c41a' : '#1890ff'};
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
      opacity: ${isHighlighted ? '1' : '0.8'};
      transform: scale(${isSelected ? '1.2' : '1'});
      z-index: ${isSelected ? '1000' : '100'};
      transition: transform 0.2s ease, background-color 0.2s ease;
    `;
    el.innerHTML = '🚛';
    el.title = vehicle.licensePlateNumber;

    el.addEventListener('click', () => {
      if (onMarkerClick) {
        onMarkerClick(vehicle);
      }
    });

    const marker = new window.vietmapgl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat([vehicle.longitude, vehicle.latitude])
      .addTo(map);

    markerRef.current = marker;
    console.log(`🚛 [SMOOTH] Created marker for vehicle ${vehicle.vehicleId}`);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [map, vehicle.vehicleId, vehicle.licensePlateNumber, vehicle.longitude, vehicle.latitude, isSelected, isHighlighted, onMarkerClick]);

  // Smooth interpolation animation
  const animate = useCallback(() => {
    const state = interpolationStateRef.current;
    if (!state || !markerRef.current) return;

    const now = performance.now();
    const elapsed = now - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1);

    // Use easing function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

    // Calculate current position
    const currentLat = state.startLat + (state.targetLat - state.startLat) * easeProgress;
    const currentLng = state.startLng + (state.targetLng - state.startLng) * easeProgress;

    // Update marker position
    markerRef.current.setLngLat([currentLng, currentLat]);

    // Continue animation if not finished
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Animation finished
      interpolationStateRef.current = null;
      console.log(`✅ [SMOOTH] Animation completed for vehicle ${vehicle.vehicleId}`);
    }
  }, [vehicle.vehicleId]);

  // Start smooth interpolation to new position
  const startInterpolation = useCallback((newLat: number, newLng: number, velocityLat: number = 0, velocityLng: number = 0) => {
    if (!markerRef.current) return;

    const currentPos = markerRef.current.getLngLat();
    const now = performance.now();
    
    // Calculate animation duration based on distance and velocity
    const distance = Math.sqrt(
      Math.pow(newLat - currentPos.lat, 2) + 
      Math.pow(newLng - currentPos.lng, 2)
    );
    
    // Use velocity to calculate duration if available
    let duration = 1000; // Default 1 second (matches 1Hz update rate)
    
    if (velocityLat !== 0 || velocityLng !== 0) {
      // Calculate expected time based on velocity
      const velocity = Math.sqrt(velocityLat * velocityLat + velocityLng * velocityLng);
      if (velocity > 0) {
        duration = (distance / velocity) * 1000; // Convert to milliseconds
        // Clamp duration to reasonable range
        duration = Math.max(500, Math.min(duration, 2000));
      }
    } else {
      // Fallback: estimate based on distance
      const baseDuration = Math.min(distance * 10000, 2000);
      duration = Math.max(baseDuration, 500);
    }

    console.log(`🎯 [SMOOTH] Starting interpolation for vehicle ${vehicle.vehicleId}`);
    console.log(`   From: [${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}]`);
    console.log(`   To: [${newLat.toFixed(6)}, ${newLng.toFixed(6)}]`);
    console.log(`   Duration: ${duration.toFixed(0)}ms, Distance: ${distance.toFixed(8)}°, Velocity: ${Math.sqrt(velocityLat * velocityLat + velocityLng * velocityLng).toFixed(8)}°/s`);

    // Cancel previous animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Set up interpolation state
    interpolationStateRef.current = {
      startLat: currentPos.lat,
      startLng: currentPos.lng,
      targetLat: newLat,
      targetLng: newLng,
      startTime: now,
      duration,
      velocityLat,
      velocityLng
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [vehicle.vehicleId, animate]);

  // Update position when vehicle data changes
  useEffect(() => {
    if (!markerRef.current) return;

    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    // Only update if enough time has passed (throttle updates)
    if (timeSinceLastUpdate < 100) return; // Max 10 FPS updates

    // CRITICAL: Check for null/undefined first
    if (vehicle.latitude == null || vehicle.longitude == null) {
      console.error(`❌ [SMOOTH] Null/undefined coordinates for vehicle ${vehicle.vehicleId}`, vehicle);
      return;
    }

    // Validate coordinates
    if (isNaN(vehicle.latitude) || isNaN(vehicle.longitude) ||
        !isFinite(vehicle.latitude) || !isFinite(vehicle.longitude)) {
      console.error(`❌ [SMOOTH] Invalid coordinates for vehicle ${vehicle.vehicleId}`, vehicle);
      return;
    }

    // Skip (0, 0) coordinates - likely bad data
    if (Math.abs(vehicle.latitude) < 0.001 && Math.abs(vehicle.longitude) < 0.001) {
      console.error(`🚫 [SMOOTH] Skipping (0, 0) coordinates for vehicle ${vehicle.vehicleId}`, vehicle);
      return;
    }

    // Extract velocity data from vehicle (if available from backend)
    const velocityLat = (vehicle as any).velocityLat || 0;
    const velocityLng = (vehicle as any).velocityLng || 0;

    // Start smooth interpolation to new position
    startInterpolation(vehicle.latitude, vehicle.longitude, velocityLat, velocityLng);
    lastUpdateTimeRef.current = now;

  }, [vehicle.latitude, vehicle.longitude, vehicle.vehicleId, startInterpolation]);

  // Update marker styling when selection changes
  useEffect(() => {
    if (!markerRef.current) return;

    const element = markerRef.current.getElement();
    if (element) {
      element.style.backgroundColor = isSelected ? '#52c41a' : '#1890ff';
      element.style.opacity = isHighlighted ? '1' : '0.8';
      element.style.transform = `scale(${isSelected ? '1.2' : '1'})`;
      element.style.zIndex = isSelected ? '1000' : '100';
    }
  }, [isSelected, isHighlighted]);

  return null; // This component doesn't render anything directly
};

// Memoize to prevent unnecessary re-renders
export default React.memo(SmoothVehicleMarker, (prevProps, nextProps) => {
  return (
    prevProps.vehicle.vehicleId === nextProps.vehicle.vehicleId &&
    prevProps.vehicle.latitude === nextProps.vehicle.latitude &&
    prevProps.vehicle.longitude === nextProps.vehicle.longitude &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.map === nextProps.map
  );
});
