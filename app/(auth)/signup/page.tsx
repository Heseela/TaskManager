'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [unit,setUnit]= useState('');
  const [role, setRole] = useState<'employee' | 'supervisor'>('employee');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    setError('');

    if (!email || !password || !confirmPassword || !name) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
     return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          unit,
          department: department || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold" style={{ color: '#981E52' }}>
            Work Report Hub
          </h1>
          <p className="text-gray-600 mt-2">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password *</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password *</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'employee' | 'supervisor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
            <Input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering (optional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Sub-Unit</label>
            <Input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Engineering (optional)"
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#0088D0' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
