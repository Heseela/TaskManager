'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  department?: string;
  subUnit?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'supervisor'>('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [departments, setDepartments] = useState<
    {
      ID: number;
      DepName: string;
      DepCode: string;
    }[]
  >([]);
  const [subUnits, setSubUnits] = useState<
    {
      ID: number;
      SubUnit: string;
    }[]
  >([]);
  const [department, setDepartment] = useState('');
  const [subUnit, setSubUnit] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/auth/register');
        const data = await res.json();
        setDepartments(data);
        if (data.length > 0) {
          setDepartment(data[0].DepCode);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!department) return;

    const fetchSubUnits = async () => {
      try {
        const selectedDepartment = departments.find(
          (d) => d.DepCode === department
        );
        if (!selectedDepartment) return;

        const res = await fetch(
          `/api/auth/register?depId=${selectedDepartment.ID}`
        );
        const data = await res.json();
        setSubUnits(data);
        setSubUnit('');
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubUnits();
  }, [department, departments]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 5) return 'Password must be at least 5 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      
      case 'department':
        if (!value) return 'Department is required';
        return '';
      
      case 'subUnit':
        if (role === 'employee' && !value) return 'Sub-unit is required for employees';
        return '';
      
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, getFieldValue(field));
    setErrors({ ...errors, [field]: error });
  };

  const getFieldValue = (field: string): string => {
    switch (field) {
      case 'name': return name;
      case 'email': return email;
      case 'password': return password;
      case 'confirmPassword': return confirmPassword;
      case 'department': return department;
      case 'subUnit': return subUnit;
      default: return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const fieldsToValidate = ['name', 'email', 'password', 'confirmPassword', 'department'];
    if (role === 'employee') {
      fieldsToValidate.push('subUnit');
    }

    fieldsToValidate.forEach(field => {
      const value = getFieldValue(field);
      const error = validateField(field, value);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setError('');

    if (!isValid) {
      const allTouched: Record<string, boolean> = {};
      fieldsToValidate.forEach(field => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
          email: email.trim(),
          password,
          name: name.trim(),
          role,
          department,
          subUnit: role === 'employee' ? subUnit : '',
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

  const shouldShowError = (field: string): boolean => {
    return touched[field] || Object.keys(errors).length > 0;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  const error = validateField('name', e.target.value);
                  setErrors({ ...errors, name: error });
                }
              }}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              className={errors.name && shouldShowError('name') ? 'border-red-500' : ''}
              required
            />
            {errors.name && shouldShowError('name') && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  const error = validateField('email', e.target.value);
                  setErrors({ ...errors, email: error });
                }
              }}
              onBlur={() => handleBlur('email')}
              placeholder="employee@company.com"
              className={errors.email && shouldShowError('email') ? 'border-red-500' : ''}
              required
            />
            {errors.email && shouldShowError('email') && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  const error = validateField('password', e.target.value);
                  setErrors({ ...errors, password: error });
                }
                if (confirmPassword && touched.confirmPassword) {
                  const confirmError = validateField('confirmPassword', confirmPassword);
                  setErrors({ ...errors, confirmPassword: confirmError });
                }
              }}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              className={errors.password && shouldShowError('password') ? 'border-red-500' : ''}
              required
            />
            {errors.password && shouldShowError('password') && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 5 characters and contain uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (touched.confirmPassword) {
                  const error = validateField('confirmPassword', e.target.value);
                  setErrors({ ...errors, confirmPassword: error });
                }
              }}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              className={errors.confirmPassword && shouldShowError('confirmPassword') ? 'border-red-500' : ''}
              required
            />
            {errors.confirmPassword && shouldShowError('confirmPassword') && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as 'employee' | 'supervisor');
                setSubUnit(''); 
                if (errors.subUnit) {
                  setErrors({ ...errors, subUnit: '' });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="employee">Employee</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (touched.department) {
                  const error = validateField('department', e.target.value);
                  setErrors({ ...errors, department: error });
                }
              }}
              onBlur={() => handleBlur('department')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.department && shouldShowError('department') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {/* <option value="">Select Department</option> */}
              {departments.map((dept) => (
                <option key={dept.ID} value={dept.DepCode}>
                  {dept.DepName}
                </option>
              ))}
            </select>
            {errors.department && shouldShowError('department') && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {/* Sub-Unit (only for employees) */}
          {role === 'employee' && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Sub-Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={subUnit}
                onChange={(e) => {
                  setSubUnit(e.target.value);
                  if (touched.subUnit) {
                    const error = validateField('subUnit', e.target.value);
                    setErrors({ ...errors, subUnit: error });
                  }
                }}
                onBlur={() => handleBlur('subUnit')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subUnit && shouldShowError('subUnit') ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!department}
              >
                {/* <option value="">Select Sub-unit</option> */}
                {subUnits.map((unit) => (
                  <option key={unit.ID} value={unit.SubUnit}>
                    {unit.SubUnit}
                  </option>
                ))}
              </select>
              {!department && (
                <p className="mt-1 text-sm text-yellow-600">Please select a department first</p>
              )}
              {errors.subUnit && shouldShowError('subUnit') && (
                <p className="mt-1 text-sm text-red-600">{errors.subUnit}</p>
              )}
            </div>
          )}

          {/* General Error */}
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