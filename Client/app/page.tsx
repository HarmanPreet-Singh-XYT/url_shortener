'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, BarChart3, Zap, Shield, ArrowRight, Sparkles, TrendingUp, Users, Globe, CheckCircle, Star, Clock, Eye, MousePointer } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const words = ['Transform', 'Optimize', 'Track', 'Analyze', 'Accelerate'];
  
  useEffect(() => {
    setMounted(true);
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Typewriter effect
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentWord.length) {
          setTypedText(currentWord.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentWordIndex, words]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200/20 border-t-purple-400"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-32 w-32 border-4 border-transparent border-b-blue-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>
      <a href='https://bolt.new'><img className='absolute top-5 right-5 w-[75px] w-[75px]' src='white_circle_360x360.png'/></a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Enhanced Hero Section */}
        <div className={`text-center mb-20 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                <Link className="h-16 w-16 text-white animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
                {typedText}
              </span>
              <span className="animate-blink text-purple-400">|</span>
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-300">
              your URLs with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                QuickLink
              </span>
              <Sparkles className="inline-block h-8 w-8 text-yellow-400 ml-4 animate-spin" />
            </h2>
          </div>
          
          <p className={`text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Create powerful, trackable short links with{' '}
            <span className="text-purple-400 font-semibold animate-pulse">
              real-time analytics
            </span>
            , custom domains, and{' '}
            <span className="text-blue-400 font-semibold">
              enterprise-grade security
            </span>
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button 
              size="lg" 
              onClick={() => router.push('/register')}
              className="group relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="group px-12 py-6 text-xl font-bold rounded-full border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 hover:text-white transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 backdrop-blur-sm"
            >
              <span className="flex items-center">
                Sign In
                <Eye className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className={`mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400 transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>30-Second Setup</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {[
            { icon: Users, value: '50K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500', delay: 'delay-100' },
            { icon: TrendingUp, value: '10M+', label: 'Links Created', color: 'from-green-500 to-emerald-500', delay: 'delay-200' },
            { icon: Globe, value: '99.9%', label: 'Uptime', color: 'from-purple-500 to-pink-500', delay: 'delay-300' }
          ].map((stat, index) => (
            <Card key={index} className={`group bg-white/5 backdrop-blur-lg border border-white/10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-110 hover:-translate-y-4 ${stat.delay}`}>
              <CardContent className="p-8">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${stat.color} p-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-300 group-hover:text-white transition-colors duration-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Features Grid */}
        <div className={`grid md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Global CDN with sub-100ms response times. Your links load instantly anywhere in the world.',
              gradient: 'from-yellow-500 to-orange-500',
              bgGradient: 'from-yellow-500/10 to-orange-500/10',
              delay: 'delay-100'
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              description: 'Real-time insights with heatmaps, conversion tracking, and AI-powered predictions.',
              gradient: 'from-green-500 to-blue-500',
              bgGradient: 'from-green-500/10 to-blue-500/10',
              delay: 'delay-200'
            },
            {
              icon: Shield,
              title: 'Enterprise Security',
              description: 'End-to-end encryption, fraud detection, and compliance with SOC 2 & GDPR.',
              gradient: 'from-purple-500 to-pink-500',
              bgGradient: 'from-purple-500/10 to-pink-500/10',
              delay: 'delay-300'
            }
          ].map((feature, index) => (
            <Card key={index} className={`group relative bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-6 ${feature.delay} overflow-hidden`}>
              {/* Animated background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <CardHeader className="relative p-8 text-center">
                <div className={`mx-auto p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl w-fit mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-300 group-hover:text-white text-lg leading-relaxed transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Enhanced Demo Section */}
        <div className={`mb-20 transition-all duration-1000 delay-1100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Card className="group relative bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative p-12 text-center">
              <h3 className="text-4xl font-bold text-white mb-8 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all duration-300">
                See QuickLink in Action
              </h3>
              <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 font-mono text-left shadow-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-4 text-gray-400 text-sm">QuickLink Console</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-purple-400 mb-2">$ Original URL:</div>
                      <div className="text-red-400 mb-4 break-all bg-red-500/10 p-3 rounded border-l-4 border-red-500">
                        https://www.example.com/very/long/url/with/many/parameters?utm_source=social&utm_medium=facebook&utm_campaign=spring2024&ref=homepage
                      </div>
                    </div>
                    
                    <div className="animate-pulse">
                      <div className="text-purple-400 mb-2">$ QuickLink URL:</div>
                      <div className="text-green-400 font-bold text-xl bg-green-500/10 p-3 rounded border-l-4 border-green-500 flex items-center">
                        https://qlink.io/abc123
                        <MousePointer className="ml-4 h-5 w-5 animate-bounce" />
                      </div>
                    </div>
                    
                    <div className="mt-6 text-gray-400 text-sm">
                      ✨ Analytics ready • 🔒 Secure • ⚡ Lightning fast
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-1300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Card className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white overflow-hidden group shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            <CardContent className="relative p-12 md:p-20">
              <div className="absolute top-8 right-8">
                <Sparkles className="h-12 w-12 text-yellow-300 animate-spin" />
              </div>
              <div className="absolute bottom-8 left-8">
                <Sparkles className="h-8 w-8 text-blue-200 animate-pulse" />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-8 transform group-hover:scale-105 transition-transform duration-500">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Transform
                </span>
                ?
              </h2>
              <p className="text-blue-100 mb-12 text-2xl leading-relaxed max-w-3xl mx-auto">
                Join <span className="font-bold text-yellow-300 text-3xl">50,000+</span> professionals who trust QuickLink 
                for mission-critical URL management
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => router.push('/register')}
                  className="group bg-white text-purple-600 hover:bg-gray-100 px-16 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
                >
                  <span className="flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/demo')}
                  className="group border-2 border-white/30 text-white hover:bg-white/10 hover:border-white px-16 py-6 text-xl font-bold rounded-full backdrop-blur-sm transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
                >
                  <span className="flex items-center">
                    Watch Demo
                    <Eye className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
              
              <div className="mt-12 text-blue-200 text-lg">
                ⭐ Trusted by Fortune 500 companies • 🚀 99.9% uptime guaranteed
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}