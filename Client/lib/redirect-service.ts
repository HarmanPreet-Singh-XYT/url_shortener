import axios from 'axios';
import { UAParser } from 'ua-parser-js';
import { RedirectReq, DeviceStruct, UTMReq } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const redirectService = {
  async handleRedirect(slug: string): Promise<string> {
    const redirectData = this.gatherRedirectData(slug);
    
    const response = await axios.post(`${API_BASE_URL}/api/redirect/${slug}`, redirectData);
    return response.data.original_url;
  },

  gatherRedirectData(slug: string): RedirectReq {
    const parser = new UAParser();
    const result = parser.getResult();
    
    // Gather device information
    const device: DeviceStruct = {
      userAgent: navigator.userAgent,
      language: navigator.language || navigator.languages?.[0] || 'en',
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: this.getDeviceType(result.device.type),
    };

    // Get referrer
    const referrer = document.referrer || '';

    // Parse UTM parameters
    const utm = this.parseUTMParams();

    // Check if this is a unique visit
    const isUnique = this.checkAndMarkUnique(slug);

    return {
      device,
      referrer,
      utm,
      isUnique,
    };
  },

  getDeviceType(deviceType?: string): 'mobile' | 'tablet' | 'desktop' {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
  },

  parseUTMParams(): UTMReq {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
    };
  },

  checkAndMarkUnique(slug: string): boolean {
    if (typeof window === 'undefined') return true;
    
    const visitedLinks = JSON.parse(localStorage.getItem('visitedLinks') || '{}');
    const isUnique = !visitedLinks[slug];
    
    if (isUnique) {
      visitedLinks[slug] = true;
      localStorage.setItem('visitedLinks', JSON.stringify(visitedLinks));
    }
    
    return isUnique;
  },
};