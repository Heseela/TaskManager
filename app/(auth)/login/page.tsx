'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const demoUsers = [
    { email: 'supervisor@company.com', password: 'demo123', role: 'Supervisor', dept: 'IT' },
    { email: 'employee@company.com', password: 'demo123', role: 'Employee', dept: 'IT - Network' },
    { email: 'employee2@company.com', password: 'demo123', role: 'Employee', dept: 'IT - Developer' },
    { email: 'employee3@company.com', password: 'demo123', role: 'Employee', dept: 'IT - Support' },
    { email: 'employee4@company.com', password: 'demo123', role: 'Employee', dept: 'IT - Infra' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full mb-4" style={{ backgroundColor: '#0088D0' }}>
            <div className="w-12 h-12 flex justify-center items-center" style={{ color: '#0088D0' }}>
            <span className="text-white font-bold text-xl">WR</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#981E52' }}>Work Report Hub</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            style={{ backgroundColor: '#0088D0' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => fillDemoCredentials(user.email, user.password)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="font-medium">{user.role}</span>
                <span className="text-gray-500 ml-2">({user.dept})</span>
                <br />
                <span className="text-xs text-gray-400">{user.email}</span>
                <span className="text-xs text-gray-400 ml-2">• {user.password}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have an account?{' '}
            <Link href="/signup" className="font-medium" style={{ color: '#0088D0' }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}