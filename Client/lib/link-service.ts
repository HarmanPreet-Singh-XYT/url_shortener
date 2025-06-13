import api from './api';
import { Link, ShortenReq, UTMReq, Analytics } from './types';

export const linkService = {
  async shortenUrl(data: ShortenReq): Promise<{ short_url: string }> {
    const response = await api.post('/user/shorten', data);
    return response.data;
  },

  async getLinks(): Promise<Link[]> {
    const response = await api.get('/user/links');
    return response.data.data;
  },

  async getLink(slug: string): Promise<Link> {
    const response = await api.get(`/user/links/${slug}`);
    return response.data;
  },

  async updateSlug(currentSlug: string, newSlug: string): Promise<void> {
    await api.patch(`/user/link/${currentSlug}`, {
      slug: newSlug,
    });
  },

  async deleteLink(slug: string): Promise<void> {
    await api.delete(`/user/links/${slug}`);
  },

  async toggleLink(slug: string): Promise<void> {
    await api.patch(`/user/toggle/${slug}`);
  },

  async updateUTM(slug: string, utm: UTMReq): Promise<void> {
    await api.patch(`/user/link/utm/${slug}`, utm);
  },

  async getAnalytics(slug: string): Promise<Analytics> {
    const response = await api.get(`/user/links/${slug}/analytics`);
    return response.data.data;
  },
};