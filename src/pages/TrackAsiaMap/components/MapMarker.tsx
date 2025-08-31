import React from 'react';
import trackasiagl from 'trackasia-gl';

// Hàm tạo marker cho điểm xuất phát và điểm đến
export const createMarker = (type: 'start' | 'end', lngLat: [number, number]) => {
    // Tạo phần tử HTML cho marker
    const el = document.createElement('div');
    el.className = `marker-${type}`;
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';

    // Đặt hình ảnh dựa vào loại marker
    if (type === 'start') {
        el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="%2322c55e">A</text></svg>')`;
    } else {
        el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="%23ef4444">B</text></svg>')`;
    }

    return new trackasiagl.Marker({ element: el }).setLngLat(lngLat);
};

// Hàm tạo marker cho vị trí người dùng
export const createUserLocationMarker = (position: [number, number]) => {
    const el = document.createElement('div');
    el.className = 'navigation-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285F4';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
    el.style.position = 'relative';

    // Add direction indicator
    const arrow = document.createElement('div');
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '6px solid transparent';
    arrow.style.borderRight = '6px solid transparent';
    arrow.style.borderBottom = '10px solid white';
    arrow.style.position = 'absolute';
    arrow.style.top = '-6px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.transformOrigin = 'center bottom';
    el.appendChild(arrow);

    return new trackasiagl.Marker({
        element: el,
        rotationAlignment: 'map'
    }).setLngLat(position);
};

// Hàm tạo marker cho phương tiện mô phỏng
export const createSimulationMarker = (position: [number, number]) => {
    // Create a custom marker element
    const el = document.createElement('div');
    el.className = 'simulation-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285F4';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 8px rgba(0,0,0,0.5)';
    el.style.position = 'relative';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    // Add car icon
    const carIcon = document.createElement('div');
    carIcon.innerHTML = '🚗';
    carIcon.style.fontSize = '16px';
    el.appendChild(carIcon);

    // Add direction indicator
    const arrow = document.createElement('div');
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '8px solid transparent';
    arrow.style.borderRight = '8px solid transparent';
    arrow.style.borderBottom = '12px solid white';
    arrow.style.position = 'absolute';
    arrow.style.top = '-10px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.transformOrigin = 'center bottom';
    el.appendChild(arrow);

    return new trackasiagl.Marker({
        element: el,
        rotationAlignment: 'map'
    }).setLngLat(position);
}; 