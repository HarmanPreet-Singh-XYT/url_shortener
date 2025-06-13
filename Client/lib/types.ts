// Authentication Types
export interface AuthRes {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface AuthTokenRes {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfoReq {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Link Types
export interface Link {
  slug: string;
  original_url: string;
  short_url: string;
  total_clicks: number;
  unique_clicks: number;
  created_at: string;
  updated_at: string;
  is_enabled: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ShortenReq {
  original_url: string;
  slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface LinkReq extends Link {}

export interface UTMReq {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// Analytics Types
export interface Analytics {
  total_clicks: number;
  unique_clicks: number;
  by_country: Record<string, number>;
  by_referrer: Record<string, number>;
  utm_breakdown: {
    utm_source: Record<string, number>;
    utm_medium: Record<string, number>;
    utm_campaign: Record<string, number>;
  };
  clicks_by_date: Record<string, number>;
  device_summary: {
    device_type: Record<string, number>;
    platform: Record<string, number>;
    language: Record<string, number>;
    screen_resolution: Record<string, number>;
    timezone: Record<string, number>;
    user_agents: Record<string, number>;
  };
}
// Redirect Types
export interface DeviceStruct {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface RedirectReq {
  device: DeviceStruct;
  referrer: string;
  utm: UTMReq;
  isUnique: boolean;
}