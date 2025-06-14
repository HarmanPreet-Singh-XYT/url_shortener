'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link as LinkIcon, Loader2, Eye, EyeOff, Check, X, Zap, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register: registerUser, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    
    checks.forEach(check => check && strength++);
    return { strength, checks };
  };

  const password = form.watch('password');
  const { strength: passwordStrength, checks: passwordChecks } = getPasswordStrength(password || '');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setRegistrationStep(1);
    
    try {
      await registerUser(data.name, data.email, data.password);
      // Simulate registration steps
      await new Promise(resolve => setTimeout(resolve, 500));
      setRegistrationStep(2);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setRegistrationStep(3);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSuccess(true);
      
      toast.success('Account created successfully!', {
        description: 'Welcome to QuickLink! Redirecting to dashboard...',
      });
      
      // Redirect after success animation
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error('Registration failed', {
        description: errorMessage,
      });
      setRegistrationStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: "Lightning fast URL shortening" },
    { icon: Shield, text: "Secure and reliable links" },
    { icon: Globe, text: "Global analytics tracking" },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Welcome to QuickLink!</h1>
          <p className="text-emerald-600 mb-4">Your account has been created successfully</p>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className="text-emerald-600">Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8 relative z-10">
        {/* Left side - Features */}
        <div className="flex-1 space-y-8 text-center lg:text-left animate-in slide-in-from-left duration-1000">
          <div>
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <LinkIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">QuickLink</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create shorter, smarter links and track their performance with our powerful analytics.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 animate-in slide-in-from-left duration-1000"
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Registration form */}
        <div className="flex-1 w-full max-w-md animate-in slide-in-from-right duration-1000">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Start your journey with QuickLink
              </CardDescription>
              
              {isLoading && (
                <div className="space-y-2">
                  {/* <Progress value={(registrationStep / 3) * 100} className="h-2" /> */}
                  <div className="text-sm text-center text-gray-500">
                    {registrationStep === 1 && "Validating information..."}
                    {registrationStep === 2 && "Creating your account..."}
                    {registrationStep === 3 && "Setting up your dashboard..."}
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...form.register('name')}
                    className="h-11 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                      <X className="w-3 h-3" />
                      <span>{form.formState.errors.name.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...form.register('email')}
                    className="h-11 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                      <X className="w-3 h-3" />
                      <span>{form.formState.errors.email.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...form.register('password')}
                      className="h-11 pr-12 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  
                  {password && (
                    <div className="space-y-2 animate-in slide-in-from-top duration-300">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength
                                ? passwordStrength < 3
                                  ? 'bg-red-400'
                                  : passwordStrength < 4
                                  ? 'bg-yellow-400'
                                  : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs space-y-1">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className={`flex items-center space-x-1 transition-colors duration-200 ${check ? 'text-green-600' : 'text-gray-400'}`}>
                            {check ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>
                              {index === 0 && "At least 8 characters"}
                              {index === 1 && "One lowercase letter"}
                              {index === 2 && "One uppercase letter"}
                              {index === 3 && "One number"}
                              {index === 4 && "One special character"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500 flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                      <X className="w-3 h-3" />
                      <span>{form.formState.errors.password.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...form.register('confirmPassword')}
                      className="h-11 pr-12 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                      <X className="w-3 h-3" />
                      <span>{form.formState.errors.confirmPassword.message}</span>
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}