'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/services/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const t = useTranslations('auth');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', {
        email,
        locale,
        frontendOrigin: window.location.origin,
      });
      setMessage(response.data.message || 'If the email exists, reset instructions were sent.');
    } catch (err: unknown) {
      setError('Unable to process request. Please try again.');
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('forgotPasswordTitle') || 'Forgot Password'}</h1>
            <p className="text-sm text-slate-500">{t('forgotPasswordDescription') || 'Enter your email to reset your password.'}</p>
          </div>

          <div className="rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white p-8">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder={t('enterEmail')}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? t('sending') || 'Sending...' : t('sendResetLink') || 'Send reset link'}
                </button>
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                <Link href={`/${locale}/auth/login`} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  {t('signInHere') || 'Back to login'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-3/5 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-800 via-blue-900 to-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/BGsign_in.png')] bg-cover bg-center opacity-80" />
        <div className="absolute inset-0 bg-linear-to-r from-white via-transparent to-transparent" />
      </div>
    </div>
  );
}
