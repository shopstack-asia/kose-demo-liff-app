/**
 * LIFF Utility
 * Handles LINE LIFF SDK initialization and permission checks
 */

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

class LiffService {
  private initialized = false;
  private profile: LineProfile | null = null;
  private liffAppId: string | null = null;
  private isInLineBrowser = false;
  
  private readonly STORAGE_KEY = 'kose_liff_profile';
  private readonly STORAGE_INITIALIZED_KEY = 'kose_liff_initialized';

  async init(liffAppId: string): Promise<{ success: boolean; error?: string }> {
    // If already initialized and logged in, return success immediately
    // This prevents re-checking after OAuth callback has been handled
    if (this.initialized && this.profile) {
      return { success: true };
    }
    
    // Try to load profile from sessionStorage first
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = sessionStorage.getItem(this.STORAGE_KEY);
        const savedInitialized = sessionStorage.getItem(this.STORAGE_INITIALIZED_KEY);
        
        if (savedProfile && savedInitialized === 'true') {
          this.profile = JSON.parse(savedProfile);
          this.initialized = true;
          return { success: true };
        }
      } catch (error) {
        console.warn('Failed to load profile from sessionStorage:', error);
      }
    }
    
    // Store LIFF App ID
    this.liffAppId = liffAppId;

    try {
      // In production: use real LIFF SDK
      // const liff = (await import('@line/liff')).default;
      // await liff.init({ liffId: liffAppId });
      
      // Check if window.liff exists (injected by LINE Browser)
      // If it exists, try to initialize it
      if (typeof window !== 'undefined' && (window as any).liff) {
        const liffObj = (window as any).liff;
        // If LIFF SDK is available, try to initialize it
        if (typeof liffObj.init === 'function') {
          try {
            await liffObj.init({ liffId: liffAppId });
          } catch (error) {
            console.warn('LIFF SDK init error:', error);
          }
        }
      } else {
        // Mock initialization for development (when window.liff doesn't exist)
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      
      // CRITICAL: Check window.liff FIRST (injected by LINE Browser)
      // When opened via LINE Browser, window.liff is automatically available
      // This check happens BEFORE checkLineBrowser() to detect LINE Browser entry early
      if (typeof window !== 'undefined' && (window as any).liff) {
        const liffObj = (window as any).liff;
        // If window.liff exists, this is definitely a LINE Browser entry
        // Use liff.isInClient() as the PRIMARY source of truth
        if (liffObj && typeof liffObj.isInClient === 'function') {
          this.isInLineBrowser = liffObj.isInClient() === true;
        } else {
          // If window.liff exists but isInClient is not available, assume LINE Browser
          this.isInLineBrowser = true;
        }
      } else {
        // If window.liff doesn't exist, use checkLineBrowser() as fallback
        // This handles mock environment or non-LINE browsers
        this.isInLineBrowser = this.checkLineBrowser();
      }
      
      // Check if we have OAuth callback code (after LINE login redirect)
      // MUST check this FIRST before any other logic
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthCode = urlParams.get('code');
        const oauthState = urlParams.get('state');
        
        // If we have OAuth callback code with state=login, user has logged in
        // Accept any state value, not just 'login' (LINE may use different state)
        if (oauthCode) {
          this.initialized = true;
          this.profile = {
            userId: 'mock_user_' + Date.now(),
            displayName: 'KOSE Member',
            pictureUrl: 'https://via.placeholder.com/150',
            statusMessage: 'Hello KOSE',
          };
          // Save to sessionStorage
          this.saveProfileToStorage();
          // Clean up URL - remove OAuth params to prevent re-trigger
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return { success: true };
        }
      }
      
      // If NOT in LINE browser AND not already logged in, check if we're in a LIFF flow
      // If URL suggests LIFF entry (has liffId param or liff.line.me), create mock profile
      if (!this.isInLineBrowser && !this.initialized) {
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.href;
          const urlParams = new URLSearchParams(window.location.search);
          const hasLiffLineMe = currentUrl.includes('liff.line.me');
          const hasLiffId = urlParams.has('liffId') || urlParams.has('liff.id');
          
          // If URL suggests LIFF entry, create mock profile for development
          if (hasLiffLineMe || hasLiffId) {
            this.initialized = true;
            this.profile = {
              userId: 'mock_user_' + Date.now(),
              displayName: 'KOSE Member',
              pictureUrl: 'https://via.placeholder.com/150',
              statusMessage: 'Hello KOSE',
            };
            // Save to sessionStorage
            this.saveProfileToStorage();
            return { success: true };
          }
        }
        
        // In production: liff.login({ redirectUri: window.location.href });
        // For now, return error to trigger redirect logic
        return { success: false, error: 'NOT_IN_LINE' };
      }
      
      // In LINE browser - check login status
      // In production: liff.isLoggedIn()
      // const loggedIn = liff.isLoggedIn();
      // if (!loggedIn) {
      //   liff.login({ redirectUri: window.location.href });
      //   return { success: false, error: 'NOT_LOGGED_IN' };
      // }
      
      // Mock: For development, simulate logged in if in LINE browser
      // (Remove this in production and use real LIFF SDK)
      this.initialized = true;
      this.profile = {
        userId: 'mock_user_' + Date.now(),
        displayName: 'KOSE Member',
        pictureUrl: 'https://via.placeholder.com/150',
        statusMessage: 'Hello KOSE',
      };
      // Save to sessionStorage
      this.saveProfileToStorage();
      return { success: true };
    } catch (error) {
      console.error('LIFF init error:', error);
      return {
        success: false,
        error: 'INIT_FAILED',
      };
    }
  }

  async login(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // In production: liff.login({ redirectUri: window.location.href });
    // For mock: redirect to LINE login URL
    const liffAppId = this.getLiffAppId();
    if (liffAppId) {
      // Extract Channel ID from LIFF App ID (format: "2007413561-1tM0q5cE" -> "2007413561")
      const channelId = liffAppId.split('-')[0];
      
      // Use root URL as redirect_uri instead of current page URL
      // This ensures redirect_uri matches what's registered in LINE Developers Console
      const baseUrl = window.location.origin;
      const redirectUri = encodeURIComponent(baseUrl + '/');
      
      const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=login&scope=profile%20openid`;
      
      window.location.href = loginUrl;
    }
  }

  private checkLineBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Use LIFF SDK's isInClient() method - DO NOT use user-agent matching
    // Check if window.liff exists and call isInClient()
    const liff = (window as any).liff;
    
    if (liff && typeof liff.isInClient === 'function') {
      const result = liff.isInClient();
      return result;
    }
    
    // Fallback: if liff exists but isInClient is not available, assume LINE browser
    // This handles cases where LIFF SDK is loaded but not fully initialized
    return !!liff;
  }

  private saveProfileToStorage(): void {
    if (typeof window !== 'undefined' && this.profile) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
        sessionStorage.setItem(this.STORAGE_INITIALIZED_KEY, 'true');
      } catch (error) {
        console.warn('Failed to save profile to sessionStorage:', error);
      }
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_INITIALIZED_KEY);
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.initialized && this.profile !== null;
  }

  getProfile(): LineProfile | null {
    // ALWAYS try to load from sessionStorage if profile is null
    // This ensures profile is available even if LIFF service instance was reset
    if (!this.profile && typeof window !== 'undefined') {
      try {
        const savedProfile = sessionStorage.getItem(this.STORAGE_KEY);
        const savedInitialized = sessionStorage.getItem(this.STORAGE_INITIALIZED_KEY);
        if (savedProfile && savedInitialized === 'true') {
          this.profile = JSON.parse(savedProfile);
          this.initialized = true;
        }
      } catch (error) {
        console.warn('Failed to load profile from sessionStorage in getProfile:', error);
      }
    }
    
    return this.profile;
  }

  getAccessToken(): string {
    return 'mock_access_token_' + Date.now();
  }

  closeWindow(): void {
    if (typeof window !== 'undefined' && (window as any).liff) {
      (window as any).liff.closeWindow();
    }
  }

  getLiffAppId(): string | null {
    return this.liffAppId;
  }

  isInLine(): boolean {
    return this.isInLineBrowser;
  }

  getLanguage(): string {
    if (typeof window === 'undefined') return 'th-TH';
    
    // Use LIFF SDK's getLanguage() method
    const liff = (window as any).liff;
    if (liff && typeof liff.getLanguage === 'function') {
      const lineLang = liff.getLanguage();
      // Normalize language code
      const normalization: Record<string, string> = {
        'th': 'th-TH',
        'en': 'en-US',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
      };
      return normalization[lineLang] || lineLang;
    }
    
    // Fallback: check browser language
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      const normalization: Record<string, string> = {
        'th': 'th-TH',
        'th-th': 'th-TH',
        'en': 'en-US',
        'en-us': 'en-US',
        'ja': 'ja-JP',
        'ja-jp': 'ja-JP',
        'zh': 'zh-CN',
        'zh-cn': 'zh-CN',
      };
      return normalization[browserLang] || browserLang;
    }
    
    return 'th-TH';
  }

  logout(): void {
    this.initialized = false;
    this.profile = null;
    this.clearStorage();
  }
}

// Singleton instance
const liffInstance = new LiffService();

export const liff = {
  init: (liffAppId: string) => liffInstance.init(liffAppId),
  isLoggedIn: () => liffInstance.isLoggedIn(),
  getProfile: () => liffInstance.getProfile(),
  getAccessToken: () => liffInstance.getAccessToken(),
  closeWindow: () => liffInstance.closeWindow(),
  getLiffAppId: () => liffInstance.getLiffAppId(),
  isInLine: () => liffInstance.isInLine(),
  isInClient: () => liffInstance.isInLine(), // Alias for consistency with LIFF SDK
  getLanguage: () => liffInstance.getLanguage(),
  login: () => liffInstance.login(),
  logout: () => liffInstance.logout(),
};

