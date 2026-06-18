import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError('Passwords do not match');
    if (newPassword.length < 8) return setError('Minimum 8 characters required');

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update password');
        setLoading(false);
        return;
      }

      // Clear stored data and redirect to login
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      window.location.href = '/';

    } catch (err) {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="text-4xl font-display font-bold tracking-tight text-[#091426]">EMS</span>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold text-slate-800">
          Set New Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          You must change your password before continuing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/60 shadow-xl rounded-2xl sm:px-10">

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 text-xs text-rose-700 rounded-md mb-4">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-[#091426] text-white rounded-xl text-xs font-bold tracking-wider disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Set Password & Continue</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}