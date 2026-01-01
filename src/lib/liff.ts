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

    // Check if running in LINE browser
    this.isInLineBrowser = this.checkLineBrowser();

    try {
      // In production: use real LIFF SDK
      // const liff = (await import('@line/liff')).default;
      // await liff.init({ liffId: liffAppId });
      
      // Mock initialization for development
      await new Promise((resolve) => setTimeout(resolve, 500));
      
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
      
      // If NOT in LINE browser AND not already logged in, redirect to LINE login
      if (!this.isInLineBrowser && !this.initialized) {
        // In production: liff.login({ redirectUri: window.location.href });
        // For now, return error to trigger redirect logic
        return { success: false, error: 'NOT_IN_LINE' };
      }
      
      // In LINE browser - check login status
      // In production:
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
      const redirectUri = encodeURIComponent(window.location.href);
      const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=login&scope=profile%20openid`;
      
      window.location.href = loginUrl;
    }
  }

  private checkLineBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check User-Agent for LINE browser
    const userAgent = window.navigator.userAgent || '';
    const isLineBrowser = /Line/i.test(userAgent);
    
    // Also check for LIFF environment
    const isLiff = typeof window !== 'undefined' && (window as any).liff;
    
    return isLineBrowser || isLiff;
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
  login: () => liffInstance.login(),
  logout: () => liffInstance.logout(),
};

