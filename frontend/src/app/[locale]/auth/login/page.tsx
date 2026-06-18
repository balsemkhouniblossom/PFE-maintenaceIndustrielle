'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const { login } = useAuth();
  const t = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userRole = await login(formData.email, formData.password);
      if (userRole === 'admin') router.replace(`/${locale}`);
      else if (userRole === 'technician') router.replace(`/${locale}/technician`);
      else router.replace(`/${locale}/operator`);

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>


      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center mb-6">
              <img
                src="/Iprotex%20logo.png"
                alt="IPROTEX Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('welcomeIprotex')}</h1>
            <p className="text-lg text-slate-500">{t('advancedMaintenance')}</p>
          </div>

          <div className="rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">{t('signIn')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('accessSystem')}</p>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder={t('enterEmail')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('enterPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? t('signingIn') : t('signIn')}
                </button>
              </div>
            </form>

      <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                {t('signup')} {' '}
                  <Link
                  href={`/${locale}/auth/register`}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-3/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800 via-blue-900 to-[#0F172A] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: 'url(/BGsign_in.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
      </div>
    </div>
  );
}

