'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Link, LogOut, User, BarChart3, ChevronDown, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5' 
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-200/30'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center group">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-300 group-hover:shadow-blue-600/40 group-hover:scale-110">
                    <Link className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    QuickLink
                  </span>
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mt-1">
                    Link Management
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Navigation Items */}
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(item.href)}
                      className="
                        relative group text-gray-600 hover:text-gray-900 hover:bg-gray-100/80
                        transition-all duration-200 rounded-lg px-3 py-2
                        before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r 
                        before:from-blue-50 before:to-indigo-50 before:opacity-0 
                        before:transition-opacity before:duration-200 
                        hover:before:opacity-100
                      "
                    >
                      <Icon className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                      <span className="relative z-10">{item.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative ml-4">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="
                    flex items-center space-x-3 px-3 py-2 rounded-lg
                    bg-gradient-to-r from-gray-50 to-gray-100/50
                    hover:from-gray-100 hover:to-gray-150
                    border border-gray-200/50 hover:border-gray-300/50
                    transition-all duration-200 group
                    shadow-sm hover:shadow-md
                  "
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`
                    h-4 w-4 text-gray-400 transition-transform duration-200
                    ${isProfileDropdownOpen ? 'rotate-180' : ''}
                  `} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="
                    absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50
                    animate-in slide-in-from-top-2 duration-200
                    backdrop-blur-xl bg-white/95
                  ">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          router.push('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="
                          w-full flex items-center px-3 py-2 text-sm text-gray-700
                          hover:bg-gray-50 rounded-lg transition-colors duration-150
                        "
                      >
                        <User className="h-4 w-4 mr-3" />
                        View Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="
                          w-full flex items-center px-3 py-2 text-sm text-red-600
                          hover:bg-red-50 rounded-lg transition-colors duration-150
                        "
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="
                  p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100
                  transition-all duration-200
                "
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="
            md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl
            animate-in slide-in-from-top-2 duration-200
          ">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="
                      w-full flex items-center px-3 py-3 text-gray-600 hover:text-gray-900
                      hover:bg-gray-50 rounded-lg transition-all duration-200
                    "
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center px-3 py-3 text-red-600
                    hover:bg-red-50 rounded-lg transition-all duration-200
                  "
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
}