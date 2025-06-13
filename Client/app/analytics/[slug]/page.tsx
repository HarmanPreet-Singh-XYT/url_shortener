'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { ArrowLeft, ExternalLink, MousePointer, Users, Calendar, Globe, Copy, TrendingUp, Eye, BarChart3, Smartphone, Languages, Clock } from 'lucide-react';
import { linkService } from '@/lib/link-service';
import { Link } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Updated Analytics interface to match backend
interface Analytics {
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

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [link, setLink] = useState<Link | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkData, analyticsData] = await Promise.all([
          linkService.getLink(slug),
          linkService.getAnalytics(slug)
        ]);
        
        setLink(linkData);
        setAnalytics(analyticsData);
      } catch (error: any) {
        toast.error('Failed to load analytics', {
          description: error.response?.data?.message || 'Please try again',
        });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, router]);

  const getFrontendBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://your-domain.com';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const calculateClickRate = () => {
    if (!analytics || analytics.total_clicks === 0) return 0;
    return ((analytics.unique_clicks / analytics.total_clicks) * 100).toFixed(1);
  };

  const getTopCountry = () => {
    if (!analytics?.by_country) return 'N/A';
    const entries = Object.entries(analytics.by_country);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getTopDevice = () => {
    if (!analytics?.device_summary?.device_type) return 'N/A';
    const entries = Object.entries(analytics.device_summary.device_type);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getTopLanguage = () => {
    if (!analytics?.device_summary?.language) return 'N/A';
    const entries = Object.entries(analytics.device_summary.language);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Header skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
              
              {/* Metrics skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Chart skeleton */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <Skeleton className="h-80 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!link || !analytics) {
    return null;
  }

  const shortUrl = `${getFrontendBaseUrl()}/${link.slug}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 animate-in slide-in-from-top duration-500">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-6 hover:bg-slate-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Link Analytics
                  </h1>
                  <div className="flex items-center gap-2 text-slate-600">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Real-time performance insights</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Active
                  </div>
                </div>
              </div>
              
              {/* URL Display Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original URL */}
                <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900">Original URL</span>
                          <p className="text-xs text-slate-500">Destination link</p>
                        </div>
                      </div>
                      <a 
                        href={link.original_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 break-all flex items-start gap-2 group transition-colors duration-200"
                      >
                        <span className="flex-1 text-sm">{link.original_url}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Short URL */}
                <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900">Short URL</span>
                          <p className="text-xs text-slate-500">Shortened link</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-purple-600 bg-purple-50 px-3 py-2 rounded-lg text-sm font-mono">
                          {shortUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(shortUrl)}
                          className="shrink-0 hover:bg-purple-50 hover:border-purple-200 transition-colors duration-200"
                        >
                          <Copy className={`h-4 w-4 ${copiedUrl ? 'text-green-600' : 'text-slate-600'} transition-colors duration-200`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid - Updated to show 6 metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Clicks */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MousePointer className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Clicks</p>
                      <p className="text-3xl font-bold text-slate-900 tabular-nums">
                        {analytics.total_clicks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    Live
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unique Clicks */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Unique Visitors</p>
                      <p className="text-3xl font-bold text-slate-900 tabular-nums">
                        {analytics.unique_clicks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Click Rate</div>
                    <div className="text-sm font-semibold text-slate-700">{calculateClickRate()}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Countries */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-300">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Countries</p>
                    <p className="text-3xl font-bold text-slate-900 tabular-nums">
                      {Object.keys(analytics.by_country || {}).length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Top: {getTopCountry()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Created Date */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-400">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Created</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {format(new Date(link.created_at), 'MMM d')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(link.created_at), 'yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Device */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-500">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Smartphone className="h-5 w-5 text-cyan-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Top Device</p>
                    <p className="text-2xl font-bold text-slate-900 capitalize">
                      {getTopDevice()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Most popular
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Language */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-500 delay-600">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <Languages className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Top Language</p>
                    <p className="text-2xl font-bold text-slate-900 uppercase">
                      {getTopLanguage()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Primary locale
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="animate-in slide-in-from-bottom duration-500 delay-700">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Performance Analytics
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Detailed insights and trends
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnalyticsCharts analytics={analytics} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}