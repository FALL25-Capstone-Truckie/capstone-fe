import React from 'react';
import { FEATURES } from '../../config';

interface FeatureWrapperProps {
    featureName: keyof typeof FEATURES;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on feature flags
 * 
 * @example
 * <FeatureWrapper featureName="LIVE_TRACKING">
 *   <LiveTrackingComponent />
 * </FeatureWrapper>
 */
const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
    featureName,
    children,
    fallback = null
}) => {
    const isFeatureEnabled = FEATURES[featureName];

    if (!isFeatureEnabled) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default FeatureWrapper; 