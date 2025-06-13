'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  MousePointer,
  Users,
  TrendingUp,
  Check,
  AlertCircle
} from 'lucide-react';
import { linkService } from '@/lib/link-service';
import { Link } from '@/lib/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface LinkListProps {
  refreshTrigger: number;
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
}

export function LinkList({ refreshTrigger,links,setLinks }: LinkListProps) {
  
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const router = useRouter();

  const fetchLinks = async () => {
    try {
      const fetchedLinks = await linkService.getLinks();
      fetchedLinks != null && setLinks(fetchedLinks);
    } catch (error: any) {
      toast.error('Failed to fetch links', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [refreshTrigger]);

  const copyToClipboard = async (text: string, slug: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    try {
      await linkService.deleteLink(slug);
      setLinks(prev => prev.filter(link => link.slug !== slug));
      toast.success('Link deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete link', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleToggle = async (slug: string) => {
    setTogglingSlug(slug);
    try {
      await linkService.toggleLink(slug);
      setLinks(prev => prev.map(link => 
        link.slug === slug 
          ? { ...link, is_enabled: !link.is_enabled }
          : link
      ));
      toast.success('Link status updated');
    } catch (error: any) {
      toast.error('Failed to update link status', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setTogglingSlug(null);
    }
  };

  const getFrontendBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://your-domain.com'; // Replace with your actual domain
  };

  const getClicksGrowthColor = (clicks: number) => {
    if (clicks === 0) return 'text-gray-400';
    if (clicks < 10) return 'text-blue-600';
    if (clicks < 50) return 'text-green-600';
    if (clicks < 100) return 'text-orange-600';
    return 'text-purple-600';
  };

  const getClicksGrowthBg = (clicks: number) => {
    if (clicks === 0) return 'bg-gray-50';
    if (clicks < 10) return 'bg-blue-50';
    if (clicks < 50) return 'bg-green-50';
    if (clicks < 100) return 'bg-orange-50';
    return 'bg-purple-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Skeleton className="h-8 w-48 mb-6" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="animate-in slide-in-from-top-4 duration-500">
        <Card className="border-dashed border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-16 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
                  <ExternalLink className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">No links yet</h3>
                <p className="text-gray-600 max-w-md">
                  Create your first shortened link above and start tracking your clicks with beautiful analytics!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in slide-in-from-top-2 duration-300">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Your Links ({links.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>
                {links.reduce((acc, link) => acc + link.total_clicks, 0)} total clicks
              </span>
            </div>
          </div>
        </CardHeader>
      </div>
      
      <div className="space-y-4">
        {links.map((link, index) => {
          const shortUrl = `${getFrontendBaseUrl()}/${link.slug}`;
          const isHovered = hoveredSlug === link.slug;
          const isCopied = copiedSlug === link.slug;
          
          return (
            <div
              key={link.slug}
              className="animate-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card 
                className={`group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border-l-4 ${
                  link.is_enabled 
                    ? 'border-l-green-500 hover:border-l-green-600' 
                    : 'border-l-gray-300 hover:border-l-gray-400'
                } ${isHovered ? 'ring-2 ring-blue-500/20' : ''}`}
                onMouseEnter={() => setHoveredSlug(link.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Header with URL and Status */}
                      <div className="flex items-start gap-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate cursor-help text-lg group-hover:text-blue-700 transition-colors">
                                  {link.original_url}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-md">
                              <p className="break-all">{link.original_url}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={link.is_enabled ? 'default' : 'secondary'}
                            className={`transition-all duration-200 ${
                              link.is_enabled 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {link.is_enabled ? 'Active' : 'Disabled'}
                          </Badge>
                          {!link.is_enabled && (
                            <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This link is currently disabled</p>
                              </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${getClicksGrowthBg(link.total_clicks)}`}>
                          <MousePointer className={`h-4 w-4 ${getClicksGrowthColor(link.total_clicks)}`} />
                          <span className={`font-semibold ${getClicksGrowthColor(link.total_clicks)}`}>
                            {link.total_clicks}
                          </span>
                          <span className="text-gray-600">clicks</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{link.unique_clicks}</span>
                          <span>unique</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(link.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>

                      {/* Short URL */}
                      <div className="relative group/url">
                        <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 transition-all duration-200 ${
                          isHovered ? 'border-blue-200 shadow-md' : 'border-gray-100'
                        }`}>
                          <code className="flex-1 text-sm font-mono text-blue-700 truncate font-medium">
                            {shortUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(shortUrl, link.slug)}
                            className={`h-8 w-8 p-0 transition-all duration-200 ${
                              isCopied 
                                ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                                : 'hover:bg-white hover:shadow-md'
                            }`}
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 animate-in zoom-in-50 duration-200" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 lg:flex-col lg:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/analytics/${link.slug}`)}
                        className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md group/btn"
                      >
                        <BarChart3 className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                        Analytics
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(link.slug)}
                        disabled={togglingSlug === link.slug}
                        className={`transition-all duration-200 hover:shadow-md ${
                          link.is_enabled 
                            ? 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700' 
                            : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                        }`}
                      >
                        {togglingSlug === link.slug ? (
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        ) : link.is_enabled ? (
                          <EyeOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        {togglingSlug === link.slug ? 'Updating...' : (link.is_enabled ? 'Disable' : 'Enable')}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200 hover:shadow-md"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="animate-in zoom-in-95 duration-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Delete Link</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete this link? This action cannot be undone.
                              The short URL <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{shortUrl}</code> will no longer work.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-gray-100 transition-colors">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(link.slug)}
                              className="bg-red-600 hover:bg-red-700 transition-colors"
                              disabled={deletingSlug === link.slug}
                            >
                              {deletingSlug === link.slug ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Deleting...
                                </>
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}