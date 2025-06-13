'use client';
import { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Navbar } from '@/components/navbar';
import { LinkShortenerForm } from '@/components/link-shortener-form';
import { LinkList } from '@/components/link-list';
import { TrendingUp, Link2, Zap, BarChart3 } from 'lucide-react';
import { Link } from '@/lib/types';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setStatsAnimated(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLinkCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const stats = useMemo(() => {
    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link.total_clicks, 0);
    const uniqueClicks = links.reduce((sum, link) => sum + link.unique_clicks, 0);
    const activeLinks = links.filter(link => link.is_enabled).length;

    return [
      { 
        icon: Link2, 
        label: 'Total Links', 
        value: totalLinks.toString(), 
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      { 
        icon: TrendingUp, 
        label: 'Total Clicks', 
        value: totalClicks.toString(), 
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600'
      },
      { 
        icon: BarChart3, 
        label: 'Unique Clicks', 
        value: uniqueClicks.toString(), 
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      { 
        icon: Zap, 
        label: 'Active Links', 
        value: activeLinks.toString(), 
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600'
      }
    ];
  }, [links]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
        <Navbar />
        
        {/* Hero Section with Animated Background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
          </div>
          
          <main className="relative max-w-7xl mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className={`mb-12 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-4">
                  Link Management Dashboard
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Transform long URLs into powerful, trackable short links with advanced analytics
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                        statsAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                            <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                          </div>
                          <div className={`h-1 w-16 bg-gradient-to-r ${stat.color} rounded-full`}></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                          <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                        </div>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 hover:opacity-5 transition-opacity duration-300`}></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className={`grid lg:grid-cols-5 gap-8 transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`} style={{ transitionDelay: '400ms' }}>
              
              {/* Link Shortener Form */}
              <div className="lg:col-span-2">
                <div className="sticky top-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                      <h2 className="text-2xl font-bold text-white mb-2">Create Short Link</h2>
                      <p className="text-blue-100">Transform your long URLs instantly</p>
                    </div>
                    <div className="p-6">
                      <LinkShortenerForm onLinkCreated={handleLinkCreated} />
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full -ml-12 -mb-12"></div>
                  </div>
                </div>
              </div>

              {/* Link List */}
              <div className="lg:col-span-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Links</h2>
                        <p className="text-gray-300">Manage and track your shortened URLs</p>
                      </div>
                      <div className="hidden sm:block">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <LinkList refreshTrigger={refreshTrigger} links={links} setLinks={setLinks} />
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -mr-20 -mt-20"></div>
                </div>
              </div>
            </div>

            {/* Floating Action Elements */}
            <div className="fixed bottom-8 right-8 z-10">
              <div className="flex flex-col space-y-4">
                <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-white group">
                  <TrendingUp className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </main>
        </div>
        
        {/* Background Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </ProtectedRoute>
  );
}