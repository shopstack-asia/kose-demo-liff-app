/**
 * Redirect Utilities
 * Handles deep link target page storage and retrieval
 */

const TARGET_PAGE_KEY = 'kose_target_page';

export function getTargetPage(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem(TARGET_PAGE_KEY);
  } catch (error) {
    console.warn('Failed to get target page from sessionStorage:', error);
    return null;
  }
}

export function setTargetPage(page: string | null): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (page) {
      sessionStorage.setItem(TARGET_PAGE_KEY, page);
    } else {
      sessionStorage.removeItem(TARGET_PAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to set target page in sessionStorage:', error);
  }
}

export function clearTargetPage(): void {
  setTargetPage(null);
}

/**
 * Validate and normalize page path
 * Allows any path that starts with valid app routes
 */
export function validatePagePath(page: string | null): string | null {
  if (!page) return null;
  
  // Remove leading slash if present
  const normalized = page.startsWith('/') ? page.slice(1) : page;
  
  // Valid base paths (app routes)
  const validBasePaths = [
    'home',
    'purchase',
    'profile',
    'vouchers',
    'offers',
    'online_shops',
  ];
  
  // Check if path starts with a valid base path
  const isValid = validBasePaths.some(basePath => 
    normalized === basePath || normalized.startsWith(basePath + '/')
  );
  
  // Also allow root-level paths that are safe
  const safeRootPaths = ['home', 'purchase', 'profile', 'vouchers', 'offers', 'online_shops'];
  if (safeRootPaths.includes(normalized)) {
    return '/' + normalized;
  }
  
  if (!isValid) {
    console.warn(`Invalid page path: ${page}, redirecting to /profile`);
    return '/profile'; // Safe fallback
  }
  
  return '/' + normalized;
}

