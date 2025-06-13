'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProtectedRoute } from '@/components/protected-route';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, Loader2, Eye, EyeOff, Shield, Calendar, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';

const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type NameForm = z.infer<typeof nameSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onUpdateName = async (data: NameForm) => {
    setIsUpdatingName(true);
    try {
      await updateProfile('name', data.name);
      toast.success('Name updated successfully');
    } catch (error: any) {
      toast.error('Failed to update name', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const onUpdateEmail = async (data: EmailForm) => {
    setIsUpdatingEmail(true);
    try {
      await updateProfile('email', data.email);
      toast.success('Email updated successfully');
    } catch (error: any) {
      toast.error('Failed to update email', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      await updateProfile('password', data.password);
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error: any) {
      toast.error('Failed to update password', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z\d]/.test(password)) score += 1;

    const strengths = [
      { strength: 0, text: '', color: '' },
      { strength: 20, text: 'Very Weak', color: 'bg-red-500' },
      { strength: 40, text: 'Weak', color: 'bg-orange-500' },
      { strength: 60, text: 'Fair', color: 'bg-yellow-500' },
      { strength: 80, text: 'Good', color: 'bg-blue-500' },
      { strength: 100, text: 'Strong', color: 'bg-green-500' },
    ];

    return strengths[score] || strengths[0];
  };

  const currentPassword = passwordForm.watch('password');
  const passwordStrength = getPasswordStrength(currentPassword);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
          {/* Header Section with Animation */}
          <div className="mb-12 text-center animate-in fade-in slide-in-from-top duration-700">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Profile Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account settings and preferences with enhanced security
            </p>
          </div>

          <div className="space-y-8">
            {/* User Info Card with Enhanced Styling */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 animate-in fade-in slide-in-from-left duration-700 delay-100 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-t-lg text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  Account Overview
                </CardTitle>
                <CardDescription className="text-slate-200">
                  Your secure account information and membership details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="group hover:bg-blue-50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                      <Label className="text-sm font-semibold text-gray-600">Member Since</Label>
                    </div>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="group hover:bg-purple-50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                      <Label className="text-sm font-semibold text-gray-600">Account ID</Label>
                    </div>
                    <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg group-hover:bg-purple-100 transition-colors">
                      {user?.id}
                    </p>
                  </div>

                  <div className="group hover:bg-green-50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                      <Label className="text-sm font-semibold text-gray-600">Account Status</Label>
                    </div>
                    <p className="text-lg font-bold text-green-700">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Name Card */}
            <Card className={`border-0 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-right duration-700 delay-200 hover:shadow-2xl ${
              expandedCard === 'name' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}>
              <CardHeader 
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                onClick={() => setExpandedCard(expandedCard === 'name' ? null : 'name')}
              >
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <User className="h-6 w-6" />
                    </div>
                    Display Name
                  </div>
                  <div className={`transition-transform duration-300 ${expandedCard === 'name' ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Update your display name across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className={`transition-all duration-500 overflow-hidden ${
                expandedCard === 'name' ? 'max-h-96 p-8' : 'max-h-0 p-0'
              }`}>
                <form onSubmit={nameForm.handleSubmit(onUpdateName)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      {...nameForm.register('name')}
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl"
                    />
                    {nameForm.formState.errors.name && (
                      <div className="flex items-center gap-2 text-red-600 animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {nameForm.formState.errors.name.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isUpdatingName}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isUpdatingName ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Name'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Update Email Card */}
            <Card className={`border-0 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-left duration-700 delay-300 hover:shadow-2xl ${
              expandedCard === 'email' ? 'ring-2 ring-green-500 ring-opacity-50' : ''
            }`}>
              <CardHeader 
                className="cursor-pointer bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg text-white hover:from-green-700 hover:to-green-800 transition-all duration-300"
                onClick={() => setExpandedCard(expandedCard === 'email' ? null : 'email')}
              >
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Mail className="h-6 w-6" />
                    </div>
                    Email Address
                  </div>
                  <div className={`transition-transform duration-300 ${expandedCard === 'email' ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CardTitle>
                <CardDescription className="text-green-100">
                  Update your email address for account communications
                </CardDescription>
              </CardHeader>
              <CardContent className={`transition-all duration-500 overflow-hidden ${
                expandedCard === 'email' ? 'max-h-96 p-8' : 'max-h-0 p-0'
              }`}>
                <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...emailForm.register('email')}
                      className="h-12 text-lg border-2 border-gray-200 focus:border-green-500 transition-all duration-300 rounded-xl"
                    />
                    {emailForm.formState.errors.email && (
                      <div className="flex items-center gap-2 text-red-600 animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {emailForm.formState.errors.email.message}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isUpdatingEmail}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isUpdatingEmail ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Email'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Update Password Card */}
            <Card className={`border-0 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-right duration-700 delay-400 hover:shadow-2xl ${
              expandedCard === 'password' ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
            }`}>
              <CardHeader 
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                onClick={() => setExpandedCard(expandedCard === 'password' ? null : 'password')}
              >
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Lock className="h-6 w-6" />
                    </div>
                    Password Security
                  </div>
                  <div className={`transition-transform duration-300 ${expandedCard === 'password' ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Change your account password with enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent className={`transition-all duration-500 overflow-hidden ${
                expandedCard === 'password' ? 'max-h-[600px] p-8' : 'max-h-0 p-0'
              }`}>
                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-base font-semibold text-gray-700">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...passwordForm.register('password')}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 rounded-xl pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {currentPassword && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Password Strength</span>
                          <span className={`text-sm font-semibold ${
                            passwordStrength.strength >= 80 ? 'text-green-600' :
                            passwordStrength.strength >= 60 ? 'text-blue-600' :
                            passwordStrength.strength >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {passwordForm.formState.errors.password && (
                      <div className="flex items-center gap-2 text-red-600 animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {passwordForm.formState.errors.password.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...passwordForm.register('confirmPassword')}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 rounded-xl pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <div className="flex items-center gap-2 text-red-600 animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
            <p className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()} • Your data is encrypted and secure
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}