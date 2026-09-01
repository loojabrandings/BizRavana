'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  LogIn,
  PhoneCall,
  Sparkles,
  User,
  X,
} from 'lucide-react';

const DEMO_USERNAME = 'user';
const DEMO_PASSWORD = '123456';

interface LifeCareLoginModalProps {
  onClose: () => void;
  onLogin: (name: string) => void;
}

export function LifeCareLoginModal({
  onClose,
  onLogin,
}: LifeCareLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim().toLowerCase() === DEMO_USERNAME &&
      password === DEMO_PASSWORD
    ) {
      onLogin(DEMO_USERNAME);
      return;
    }
    setError(true);
  };

  const fillDemo = () => {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    setError(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D1527]/70 backdrop-blur-sm z-0"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-fade-up">
        {/* Close Button — outside overflow containers for reliable clicks */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-white/50 text-[#0D1527] hover:text-rose-600 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="relative bg-[#102BDC] text-white p-5 sm:p-6 overflow-hidden rounded-t-3xl">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-3">
              <User size={22} />
            </div>
            <h3 className="font-dm-sans font-bold text-xl leading-snug">
              Welcome back
            </h3>
            <p className="font-inter text-xs text-white/75 mt-1">
              Log in to manage your appointments &amp; channeling.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
              <AlertCircle
                size={15}
                className="text-rose-600 flex-shrink-0 mt-0.5"
              />
              <p className="font-inter text-xs text-rose-700 leading-snug">
                Invalid username or password. Please try again.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="lifecare-username"
              className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5"
            >
              Username / Phone Number
            </label>
            <input
              id="lifecare-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              placeholder="user or 07X XXX XXXX"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition"
            />
          </div>

          <div>
            <label
              htmlFor="lifecare-password"
              className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5"
            >
              Password
            </label>
            <input
              id="lifecare-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#102BDC] hover:bg-[#0C22B0] text-white py-3.5 rounded-xl font-inter font-semibold text-sm shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            <LogIn size={15} />
            Log In
          </button>

          {/* Demo credentials hint */}
          <div className="rounded-xl bg-[#102BDC]/5 border border-[#102BDC]/20 p-3.5">
            <p className="font-inter text-[11px] text-[#475569] leading-snug mb-2">
              <span className="font-semibold text-[#102BDC]">Demo access:</span>{' '}
              username <span className="font-mono text-[#0D1527]">user</span> ·
              password <span className="font-mono text-[#0D1527]">123456</span>
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full inline-flex items-center justify-center gap-2 border border-[#102BDC]/30 bg-white hover:bg-[#102BDC]/5 text-[#102BDC] py-2 rounded-lg font-inter font-medium text-xs transition-colors"
            >
              <Sparkles size={12} />
              Auto-fill Demo Login
            </button>
          </div>

          <p className="font-inter text-[11px] text-[#94A3B8] text-center flex items-center justify-center gap-1.5">
            <PhoneCall size={11} />
            or call the hotline — +94 45 228 7800
          </p>
        </form>
      </div>
    </div>
  );
}