'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Link, Loader2, Sparkles, Zap, Settings } from 'lucide-react';
import { linkService } from '@/lib/link-service';
import { toast } from 'sonner';
import { ShortenReq } from '@/lib/types';

const shortenSchema = z.object({
  original_url: z.string().url('Please enter a valid URL'),
  slug: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

type ShortenForm = z.infer<typeof shortenSchema>;

interface LinkShortenerFormProps {
  onLinkCreated: () => void;
}

export function LinkShortenerForm({ onLinkCreated }: LinkShortenerFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const form = useForm<ShortenForm>({
    resolver: zodResolver(shortenSchema),
    defaultValues: {
      original_url: '',
      slug: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
    },
  });

  const onSubmit = async (data: ShortenForm) => {
    setIsLoading(true);
    try {
      const payload: ShortenReq = {
        original_url: data.original_url,
      };

      // Only include optional fields if they have values
      if (data.slug?.trim()) payload.slug = data.slug.trim();
      if (data.utm_source?.trim()) payload.utm_source = data.utm_source.trim();
      if (data.utm_medium?.trim()) payload.utm_medium = data.utm_medium.trim();
      if (data.utm_campaign?.trim()) payload.utm_campaign = data.utm_campaign.trim();

      const response = await linkService.shortenUrl(payload);
      
      toast.success('Link shortened successfully!', {
        description: `Short URL: ${response.short_url}`,
      });
      
      form.reset();
      setIsAdvancedOpen(false);
      onLinkCreated();
    } catch (error: any) {
      toast.error('Failed to shorten URL', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-3xl animate-pulse"></div>
      
      <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl overflow-hidden group">
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="h-full w-full rounded-2xl bg-white"></div>
        </div>
        
        <CardHeader className="relative bg-gradient-to-r from-blue-50 to-purple-50 pb-8">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <div className="relative">
              <Link className="h-6 w-6 text-blue-600 animate-bounce" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-ping" />
            </div>
            Shorten Your URL
          </CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2 animate-fade-in">
            Transform long URLs into powerful, trackable links
          </p>
        </CardHeader>

        <CardContent className="relative p-8 space-y-6">
          <div onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main URL Input */}
            <div className="space-y-3">
              <Label 
                htmlFor="original_url" 
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-yellow-500" />
                Original URL *
              </Label>
              <div className="relative group">
                <Input
                  id="original_url"
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  {...form.register('original_url')}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className={`
                    w-full h-14 text-lg rounded-xl border-2 transition-all duration-300 pl-4 pr-4
                    ${inputFocused 
                      ? 'border-blue-500 shadow-lg shadow-blue-200 scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    focus:ring-0 focus:border-blue-500
                  `}
                />
                <div className={`
                  absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10 blur-md transition-opacity duration-300
                  ${inputFocused ? 'opacity-100' : 'opacity-0'}
                `}></div>
              </div>
              {form.formState.errors.original_url && (
                <div className="animate-shake">
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                    {form.formState.errors.original_url.message}
                  </p>
                </div>
              )}
            </div>

            {/* Advanced Options Collapsible */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`
                    w-full h-12 justify-between rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]
                    ${isAdvancedOpen 
                      ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-lg shadow-purple-100' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Options
                  </span>
                  <div className={`transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="overflow-hidden transition-all duration-500 ease-in-out">
                <div className="space-y-6 mt-6 p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border border-gray-200">
                  {/* Custom Slug */}
                  <div className="space-y-3">
                    <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                      Custom Slug (optional)
                    </Label>
                    <Input
                      id="slug"
                      placeholder="my-awesome-link"
                      {...form.register('slug')}
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 transition-all duration-200 hover:border-gray-300"
                    />
                    <p className="text-xs text-gray-500 bg-white/60 p-2 rounded-lg">
                      💡 Leave empty for auto-generated slug
                    </p>
                  </div>

                  {/* UTM Parameters */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      📊 UTM Tracking Parameters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="utm_source" className="text-xs font-medium text-gray-600">
                          UTM Source
                        </Label>
                        <Input
                          id="utm_source"
                          placeholder="twitter"
                          {...form.register('utm_source')}
                          className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-400 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="utm_medium" className="text-xs font-medium text-gray-600">
                          UTM Medium
                        </Label>
                        <Input
                          id="utm_medium"
                          placeholder="social"
                          {...form.register('utm_medium')}
                          className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-400 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="utm_campaign" className="text-xs font-medium text-gray-600">
                          UTM Campaign
                        </Label>
                        <Input
                          id="utm_campaign"
                          placeholder="spring_sale"
                          {...form.register('utm_campaign')}
                          className="h-11 rounded-lg border-2 border-gray-200 focus:border-blue-400 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit)}
              className={`
                w-full h-14 rounded-xl text-lg font-semibold transition-all duration-300 transform
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-xl active:scale-95'
                }
                shadow-lg
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="animate-pulse">Shortening your link...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Zap className="h-5 w-5" />
                  <span>Shorten URL</span>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
              )}
            </Button>
                      </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <Link className="h-32 w-32 text-blue-500 transform rotate-12" />
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}