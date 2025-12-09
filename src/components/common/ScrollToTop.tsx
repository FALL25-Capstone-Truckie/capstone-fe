import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to top on route changes
 * This should be placed inside the Router to work with all routes
 * 
 * Features:
 * - Instant scroll for better UX during fast navigation
 * - Preserves scroll position for hash links
 * - Works with all layout types (MainLayout, AdminLayout, etc.)
 */
const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Skip scroll restoration if there's a hash (anchor link)
    if (location.hash) {
      return;
    }

    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant instead of smooth to avoid jarring animations
    });
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToTop;
