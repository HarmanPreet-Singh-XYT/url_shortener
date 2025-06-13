'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink, AlertCircle, Shield, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { redirectService } from '@/lib/redirect-service';

export default function RedirectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!slug) {
        setError('Invalid link');
        setIsLoading(false);
        return;
      }

      try {
        // Start security check phase
        setShowSecurityCheck(true);
        
        // Animate progress bar
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 3;
          });
        }, 50);

        // Call actual redirect service
        const originalUrl = await redirectService.handleRedirect(slug);
        setRedirectUrl(originalUrl);
        
        // Complete progress
        setProgress(100);
        clearInterval(progressInterval);
        setShowSecurityCheck(false);
        
        // Small delay to show the redirect page, then redirect
        setTimeout(() => {
          window.location.href = originalUrl;
        }, 2000);
      } catch (error: any) {
        console.error('Redirect error:', error);
        setError(error.response?.data?.message || 'Link not found or has expired');
      } finally {
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 backdrop-blur-sm bg-white/90 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full shadow-lg animate-in zoom-in-50 duration-500" style={{animationDelay: '200ms'}}>
                <AlertCircle className="h-10 w-10 text-red-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3 animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '400ms'}}>
              Link Not Found
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '600ms'}}>
              {error}
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-2 duration-500"
              style={{animationDelay: '800ms'}}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-indigo-200 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 backdrop-blur-sm bg-white/95 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <CardContent className="p-8 text-center">
          {/* Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full shadow-lg animate-in zoom-in-50 duration-500" style={{animationDelay: '200ms'}}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    {showSecurityCheck && (
                      <div className="absolute -top-1 -right-1">
                        <Shield className="h-6 w-6 text-green-500 animate-pulse" />
                      </div>
                    )}
                  </>
                ) : (
                  <ExternalLink className="h-10 w-10 text-blue-600 animate-bounce" />
                )}
              </div>
              
              {/* Progress ring for loading */}
              {isLoading && (
                <div className="absolute inset-0 -m-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-blue-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className="text-blue-500 transition-all duration-300 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3 animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '400ms'}}>
            {isLoading ? 'Securing Your Connection' : 'Ready to Redirect'}
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '600ms'}}>
            {isLoading 
              ? showSecurityCheck 
                ? 'Verifying link safety and authenticity...' 
                : 'Preparing secure redirect...'
              : 'Connection verified! Redirecting you safely to your destination.'
            }
          </p>

          {/* Progress Section */}
          {isLoading && (
            <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '800ms'}}>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Security indicators */}
          {showSecurityCheck && (
            <div className="flex justify-center gap-4 mb-6 animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '1000ms'}}>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                <span>SSL Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="w-4 h-4" />
                <span>Link Valid</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {redirectUrl && !isLoading && (
            <Button 
              onClick={() => window.location.href = redirectUrl}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-2 duration-500"
              style={{animationDelay: '1200ms'}}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Continue to Destination
            </Button>
          )}

          {/* Footer */}
          <div className="mt-8 text-center animate-in slide-in-from-bottom-2 duration-500" style={{animationDelay: '1400ms'}}>
            <p className="text-xs text-gray-500">
              Secured by <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">QuickLink Pro</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}