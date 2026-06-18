import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { UserSession, Employee } from '../types';

interface LoginFormProps {
  employees: Employee[];
  onLogin: (session: UserSession) => void;
}

export default function LoginForm({ employees, onLogin }: LoginFormProps) {
  const [role, setRole] = useState<'Admin' | 'Employee'>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole: 'Admin' | 'Employee') => {
    setRole(selectedRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem('ems_token', data.token);
      localStorage.setItem('ems_user', JSON.stringify(data.user));

      // Force password change check
      if (data.user.password_changed === false || data.user.password_changed === 0) {
        window.location.href = '/change-password';
        return;
      }

      onLogin({
        email: data.user.email,
        fullName: data.user.name,
        role: data.user.role === 'admin' ? 'Admin' : 'Employee',
        employeeId: data.user.id.toString()
      });

    } catch (err) {
      setError('Cannot reach server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#F7F9FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center items-center">
          <span className="text-4xl font-display font-bold tracking-tight text-[#091426]">EMS</span>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold tracking-tight text-slate-800">
          Sign in to your workplace portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-sans">
          Secure, role-based access for Enterprise Governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/60 shadow-xl rounded-2xl sm:px-10">

          {/* Role selector */}
          <div className="flex bg-[#f2f4f6] rounded-xl p-1.5 mb-6">
            <button
              id="admin-login-tab"
              type="button"
              onClick={() => handleRoleChange('Admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                role === 'Admin'
                  ? 'bg-[#091426] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <button
              id="employee-login-tab"
              type="button"
              onClick={() => handleRoleChange('Employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                role === 'Employee'
                  ? 'bg-[#2170e4] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Employee Portal</span>
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-3 text-xs text-rose-700 font-sans rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold tracking-wider text-white transition-all focus:outline-none active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                  role === 'Admin' ? 'bg-[#091426] hover:bg-slate-800' : 'bg-[#2170e4] hover:bg-[#1a5cbd]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center font-sans">
              Accounts are created by the HR Administrator. Contact your manager if you need access.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}