import React, { useState } from 'react';
import {
  Sprout,
  Building2,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Tractor,
  Store
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { authApi, setToken } from '../api/client';

interface LoginScreenProps {
  onLogin: (userRole: any) => void;
}

type LoginStep = 'role-select' | 'login' | 'signup';
type SelectedRole = 'farmer' | 'buyer' | null;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<LoginStep>('role-select');
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    farmName: '',
    location: '',
    company: '',
  });

  const handleRoleSelect = (role: 'farmer' | 'buyer') => {
    setSelectedRole(role);
    setStep('login');
    setError('');
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const demoEmail = selectedRole === 'farmer' ? 'ramesh@agriconnect.in' : 'rajesh@apexfoods.in';
      const result: any = await authApi.login(demoEmail, 'password123');
      setToken(result.token);
      onLogin({ type: result.user.role, currentUser: result.user });
    } catch (err: any) {
      // If demo accounts don't exist yet, create them
      try {
        const demoData = selectedRole === 'farmer'
          ? { email: 'ramesh@agriconnect.in', phone: '+919825411209', password: 'password123', name: 'Ramesh Patel', role: 'farmer', organizationOrFarm: 'Patel Bio-Organic Agro Farm (18 Acres)', location: 'Bardoli, Surat, Gujarat' }
          : { email: 'rajesh@apexfoods.in', phone: '+919811044219', password: 'password123', name: 'Rajesh Singhania', role: 'buyer', organizationOrFarm: 'Apex Food Processing & Exports Corp', location: 'New Delhi / Mundra Port Hub' };
        const result: any = await authApi.register(demoData);
        setToken(result.token);
        onLogin({ type: result.user.role, currentUser: result.user });
      } catch {
        setError('Demo login failed. Please try registering a new account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailOrPhone = form.email || form.phone;
    if (!emailOrPhone) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result: any = await authApi.login(emailOrPhone, form.password);
      setToken(result.token);
      onLogin({ type: result.user.role, currentUser: result.user });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name) { setError('Please enter your name'); return; }
    if (!form.email) { setError('Please enter your email'); return; }
    if (!form.phone) { setError('Please enter your phone number'); return; }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const result: any = await authApi.register({
        email: form.email,
        phone: form.phone,
        password: form.password,
        name: form.name,
        role: selectedRole!,
        organizationOrFarm: selectedRole === 'farmer' ? form.farmName : form.company,
        location: form.location,
      });
      setToken(result.token);
      onLogin({ type: result.user.role, currentUser: result.user });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-auto">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-3 sm:mx-4 py-8 animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">AgriConnect</h1>
          <p className="text-emerald-200/70 text-xs mt-1">Direct Farmer-to-Buyer Marketplace</p>
        </div>

        {/* STEP 1: Role Selection */}
        {step === 'role-select' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-center text-sm mb-4">I want to join as</h2>

            <button
              onClick={() => handleRoleSelect('farmer')}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-left hover:bg-white/20 hover:border-emerald-300/50 transition-all cursor-pointer group hover:scale-[1.02]"
              id="login-select-farmer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <span>👨‍🌾</span> Farmer
                  </h3>
                  <p className="text-emerald-200/60 text-xs mt-0.5">
                    Sell crops, manage harvest lots, AI advisory, weather alerts
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('buyer')}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-left hover:bg-white/20 hover:border-blue-300/50 transition-all cursor-pointer group hover:scale-[1.02]"
              id="login-select-buyer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <span>🏢</span> Buyer
                  </h3>
                  <p className="text-emerald-200/60 text-xs mt-0.5">
                    Browse verified crops, negotiate contracts, bulk procurement
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <p className="text-center text-emerald-300/40 text-[10px] mt-4">
              © 2026 AgriConnect • Empowering Indian Agriculture
            </p>
          </div>
        )}

        {/* STEP 2: Login Form */}
        {step === 'login' && selectedRole && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { setStep('role-select'); setSelectedRole(null); setError(''); }}
                className="flex items-center gap-1 text-emerald-200/70 hover:text-white text-xs transition cursor-pointer"
                id="login-back-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedRole === 'farmer'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
              }`}>
                {selectedRole === 'farmer' ? <Sprout className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                {selectedRole === 'farmer' ? 'Farmer' : 'Buyer'}
              </div>
            </div>

            <h2 className="text-white font-bold text-lg mb-1">
              {selectedRole === 'farmer' ? '👨‍🌾 Welcome, Farmer!' : '🏢 Welcome, Buyer!'}
            </h2>
            <p className="text-emerald-200/60 text-xs mb-5">Sign in to access your dashboard</p>

            {/* Login / Signup Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
              <button
                onClick={() => { setStep('login'); setError(''); }}
                className="flex-1 py-2 rounded-lg text-xs font-bold bg-white/15 text-white transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => { setStep('signup'); setError(''); setForm({ name: '', email: '', phone: '', password: '', farmName: '', location: '', company: '' }); }}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-emerald-200/60 hover:text-white transition cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-lg p-2.5 mb-4 text-rose-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                  id="login-email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/50 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                  selectedRole === 'farmer'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30'
                }`}
                id="login-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-emerald-200/40 text-[10px] font-bold uppercase">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-bold text-emerald-200/80 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="demo-login-btn"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {selectedRole === 'farmer' ? 'Demo: Login as Ramesh Patel (Farmer)' : 'Demo: Login as Rajesh Singhania (Buyer)'}
            </button>
          </div>
        )}

        {/* STEP 3: Signup Form */}
        {step === 'signup' && selectedRole && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => { setStep('login'); setError(''); }}
                className="flex items-center gap-1 text-emerald-200/70 hover:text-white text-xs transition cursor-pointer"
                id="signup-back-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedRole === 'farmer'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
              }`}>
                {selectedRole === 'farmer' ? <Sprout className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                {selectedRole === 'farmer' ? 'Farmer' : 'Buyer'}
              </div>
            </div>

            <h2 className="text-white font-bold text-lg mb-1">
              {selectedRole === 'farmer' ? '🌱 Create Farmer Account' : '🏢 Create Buyer Account'}
            </h2>
            <p className="text-emerald-200/60 text-xs mb-5">
              {selectedRole === 'farmer'
                ? 'Join thousands of verified farmers selling directly to buyers'
                : 'Connect with verified farmers for bulk procurement'}
            </p>

            {error && (
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-lg p-2.5 mb-4 text-rose-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-name" />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-email" />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="Phone number"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-phone" />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Password (min 6 characters)"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/50 hover:text-white transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                <input type="text" value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Location (e.g. Surat, Gujarat)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-location" />
              </div>

              {selectedRole === 'farmer' ? (
                <div className="relative">
                  <Tractor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                  <input type="text" value={form.farmName} onChange={(e) => updateForm('farmName', e.target.value)} placeholder="Farm name (optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-farm-name" />
                </div>
              ) : (
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50" />
                  <input type="text" value={form.company} onChange={(e) => updateForm('company', e.target.value)} placeholder="Company name (optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" id="signup-company-name" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                  selectedRole === 'farmer'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30'
                }`}
                id="signup-submit-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? 'Creating Account...' : `Create ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
              </button>
            </form>

            <p className="text-center text-emerald-200/30 text-[10px] mt-4 leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
