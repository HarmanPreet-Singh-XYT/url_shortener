import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, Globe, Smartphone, Monitor, Calendar, ExternalLink, Zap, Users, Clock, Languages } from 'lucide-react';

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

interface AnalyticsChartsProps {
  analytics: Analytics;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Transform data for charts
  const transformObjectToArray = (obj: Record<any, any>, nameKey = 'name', valueKey = 'value') => {
    return Object.entries(obj || {})
      .map(([key, value]) => ({ [nameKey]: key, [valueKey]: value }))
      .sort((a, b) => b[valueKey] - a[valueKey])
      .slice(0, 10); // Top 10 items
  };

  const clicksByDateData = Object.entries(analytics.clicks_by_date || {})
    .map(([date, clicks]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks,
      fullDate: date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const countryData = transformObjectToArray(analytics.by_country, 'country', 'clicks');
  const referrerData = transformObjectToArray(analytics.by_referrer, 'referrer', 'clicks');
  const deviceTypeData = transformObjectToArray(analytics.device_summary?.device_type, 'device', 'clicks');
  const platformData = transformObjectToArray(analytics.device_summary?.platform, 'platform', 'clicks');
  const languageData = transformObjectToArray(analytics.device_summary?.language, 'language', 'clicks');
  const timezoneData = transformObjectToArray(analytics.device_summary?.timezone, 'timezone', 'clicks');
  const utmSourceData = transformObjectToArray(analytics.utm_breakdown?.utm_source, 'source', 'clicks');
  const utmMediumData = transformObjectToArray(analytics.utm_breakdown?.utm_medium, 'medium', 'clicks');
  const utmCampaignData = transformObjectToArray(analytics.utm_breakdown?.utm_campaign, 'campaign', 'clicks');

  const TabButton = ({ id, label, icon: Icon, isActive }: { id: string; label: string; icon: any; isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  const ChartCard = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
    <Card className={`border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Clicks Over Time */}
      <ChartCard title="Clicks Over Time" icon={TrendingUp} className="lg:col-span-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clicksByDateData}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#clicksGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top Countries */}
      <ChartCard title="Top Countries" icon={Globe}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" fontSize={12} />
              <YAxis dataKey="country" type="category" stroke="#64748B" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Device Types */}
      <ChartCard title="Device Types" icon={Smartphone}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="clicks"
                label={({ device, percent }) => `${device} ${(percent * 100).toFixed(1)}%`}
              >
                {deviceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );

  const renderTraffic = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Referrers */}
      <ChartCard title="Top Referrers" icon={ExternalLink} className="lg:col-span-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={referrerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="referrer" 
                stroke="#64748B" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* UTM Sources */}
      <ChartCard title="UTM Sources" icon={Zap}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utmSourceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" fontSize={12} />
              <YAxis dataKey="source" type="category" stroke="#64748B" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* UTM Mediums */}
      <ChartCard title="UTM Mediums" icon={Users}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={utmMediumData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="clicks"
                label={({ medium, percent }) => `${medium} ${(percent * 100).toFixed(1)}%`}
              >
                {utmMediumData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );

  const renderDevices = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Platforms */}
      <ChartCard title="Platforms" icon={Monitor}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="platform" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Languages */}
      <ChartCard title="Languages" icon={Languages}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="clicks"
                label={({ language, percent }) => `${language} ${(percent * 100).toFixed(1)}%`}
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Timezones */}
      <ChartCard title="Timezones" icon={Clock} className="lg:col-span-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timezoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="timezone" 
                stroke="#64748B" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );

  const renderUTMCampaigns = () => (
    <div className="grid grid-cols-1 gap-6">
      <ChartCard title="UTM Campaigns" icon={Zap} className="w-full">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utmCampaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="campaign" 
                stroke="#64748B" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#84CC16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
        <TabButton id="overview" label="Overview" icon={TrendingUp} isActive={activeTab === 'overview'} />
        <TabButton id="traffic" label="Traffic Sources" icon={ExternalLink} isActive={activeTab === 'traffic'} />
        <TabButton id="devices" label="Devices & Locations" icon={Smartphone} isActive={activeTab === 'devices'} />
        <TabButton id="campaigns" label="Campaigns" icon={Zap} isActive={activeTab === 'campaigns'} />
      </div>

      {/* Chart Content */}
      <div className="animate-in slide-in-from-bottom duration-500">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'traffic' && renderTraffic()}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'campaigns' && renderUTMCampaigns()}
      </div>
    </div>
  );
}