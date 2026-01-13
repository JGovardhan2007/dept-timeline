import React, { useState } from 'react';
import { ADMIN_PIN, MAX_LOGIN_ATTEMPTS } from '../constants';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      setError('Too many attempts. Access locked.');
      return;
    }

    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setAttempts(p => p + 1);
      setError(`Invalid PIN. ${MAX_LOGIN_ATTEMPTS - (attempts + 1)} attempts remaining.`);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-8 transform transition-all">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-600">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Access</h2>
          <p className="text-slate-500 text-sm mt-1">Enter PIN to manage timeline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={ADMIN_PIN.length}
              value={pin}
              onChange={(e) => { setError(''); setPin(e.target.value); }}
              placeholder="Enter PIN"
              className="w-full text-center text-2xl tracking-widest py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={pin.length < 4 || attempts >= MAX_LOGIN_ATTEMPTS}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Access Dashboard
          </button>
        </form>

        <button
          onClick={onCancel}
          className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel and return to timeline
        </button>
      </div>
    </div>
  );
};
