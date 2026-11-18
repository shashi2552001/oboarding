import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { NineHrLogo } from './NineHrLogo.tsx';
import {
  ArrowRight,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  X,
  PhoneCall,
  Mail,
  ShieldAlert,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    lookupAccount,
    login,
    lookupResult,
    lookupError,
    loginError,
    isAuthenticating,
    resetLookup,
  } = useAuth();

  // Step 1 state
  const [identifier, setIdentifier] = useState('');
  const [localInputError, setLocalInputError] = useState('');

  // Step 2 state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaOtp, setMfaOtp] = useState('');
  const [isMfaStep, setIsMfaStep] = useState(false);

  // Recovery modal state
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Help Modal state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Handle Step 1: Submit Identifier
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalInputError('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setLocalInputError('Please enter your Employee ID, Candidate ID, or official email.');
      return;
    }

    if (trimmed.length < 3) {
      setLocalInputError('Identifier is too short. Please check and try again.');
      return;
    }

    await lookupAccount(trimmed);
  };

  // Handle Step 2: Submit Password / MFA
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return;
    }

    const res = await login(password, mfaOtp);
    if (res.requiresMfa) {
      setIsMfaStep(true);
    }
  };

  // Handle Account Recovery Step 1
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMsg(null);
    if (!recoveryIdentifier.trim()) {
      setRecoveryMsg({ type: 'error', text: 'Please enter your ID or Email address.' });
      return;
    }

    setIsRecovering(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryMsg({
          type: 'success',
          text: data.verificationCode
            ? `Security code generated: ${data.verificationCode}. Please enter it below along with your new password.`
            : 'If your account is registered, recovery instructions have been sent.',
        });
        if (data.verificationCode) {
          setRecoveryToken(data.verificationCode);
        }
        setRecoveryStep('verify');
      } else {
        setRecoveryMsg({ type: 'error', text: data.error || 'Failed to request recovery.' });
      }
    } catch {
      setRecoveryMsg({ type: 'error', text: 'Network connection failed. Please try again.' });
    } finally {
      setIsRecovering(false);
    }
  };

  // Handle Account Recovery Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMsg(null);

    if (!recoveryToken.trim() || !newPassword) {
      setRecoveryMsg({ type: 'error', text: 'Please enter the verification code and new password.' });
      return;
    }

    if (newPassword.length < 8) {
      setRecoveryMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsRecovering(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: recoveryIdentifier.trim(),
          resetToken: recoveryToken.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setIsRecoveryOpen(false);
          setRecoveryStep('request');
          setRecoveryToken('');
          setNewPassword('');
          setConfirmPassword('');
          resetLookup();
          setIdentifier(recoveryIdentifier);
        }, 1800);
      } else {
        setRecoveryMsg({ type: 'error', text: data.error || 'Reset failed.' });
      }
    } catch {
      setRecoveryMsg({ type: 'error', text: 'Network error occurred while resetting password.' });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <NineHrLogo size="md" variant="white" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Cloud SQL Gateway</span>
          </div>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Support & First-Time Access</span>
          </button>
        </div>
      </header>

      {/* Main Single Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 transition-all duration-300 hover:border-slate-700">
            {/* Header Content */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <NineHrLogo size="lg" variant="mark" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Welcome to 9HR India
              </h1>
              <p className="text-sm text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Secure HR Onboarding Portal</span>
              </p>
            </div>

            {/* Error Banners */}
            {(localInputError || lookupError || loginError) && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-snug">
                  {localInputError || lookupError || loginError}
                </div>
              </div>
            )}

            {/* STEP 1: Enter ID / Email */}
            {!lookupResult ? (
              <form onSubmit={handleContinue} className="space-y-5">
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
                  >
                    Employee ID / Candidate ID / Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setLocalInputError('');
                      }}
                      placeholder="e.g. 9HR-EMP-1001, 9HR-CAN-2024, or email"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      disabled={isAuthenticating}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Enter the ID issued in your 9HR offer letter or your registered corporate email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryIdentifier(identifier);
                      setIsRecoveryOpen(true);
                    }}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Forgot password or first-time setup?</span>
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Authenticate Password & Optional MFA */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Identified Account Badge (Never reveals privileged role) */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {lookupResult.fullName.charAt(0)}
                    </div>
                    <div className="truncate text-left">
                      <div className="text-sm font-semibold text-white truncate">
                        {lookupResult.fullName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate">
                        {lookupResult.identifier} ({lookupResult.maskedEmail})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetLookup}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    Change ID
                  </button>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryIdentifier(lookupResult.identifier);
                        setIsRecoveryOpen(true);
                      }}
                      className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your portal password"
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      disabled={isAuthenticating}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* MFA / Security Verification Code (if required by policy or prompted) */}
                {(lookupResult.requiresMfa || isMfaStep) && (
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <label
                        htmlFor="mfaOtp"
                        className="text-xs font-semibold uppercase tracking-wider text-blue-200"
                      >
                        6-Digit Security Code (MFA)
                      </label>
                    </div>
                    <input
                      id="mfaOtp"
                      type="text"
                      maxLength={6}
                      value={mfaOtp}
                      onChange={(e) => setMfaOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 984512"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      disabled={isAuthenticating}
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Multi-Factor Authentication is enforced for privileged roles (Code: 984512).
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating || !password}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating & Creating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer Security Badges */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} 9HR India Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>ISO 27001 Certified</span>
              <span>•</span>
              <span>256-bit Encrypted Session</span>
              <span>•</span>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="hover:text-slate-300 underline cursor-pointer"
              >
                Onboarding Support
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Account Recovery & Password Reset Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => {
                setIsRecoveryOpen(false);
                setRecoveryMsg(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Account Recovery</h3>
                <p className="text-xs text-slate-400">Reset your 9HR India onboarding credentials</p>
              </div>
            </div>

            {recoveryMsg && (
              <div
                className={`mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  recoveryMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {recoveryMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                )}
                <div className="leading-relaxed">{recoveryMsg.text}</div>
              </div>
            )}

            {recoveryStep === 'request' ? (
              <form onSubmit={handleRequestRecovery} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Employee ID / Candidate ID / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="e.g. 9HR-CAN-2024 or candidate@9hrindia.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRecovering ? 'Generating Code...' : 'Request Security Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryToken}
                    onChange={(e) => setRecoveryToken(e.target.value)}
                    placeholder="6-digit recovery code"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password (min. 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRecovering ? 'Updating Password...' : 'Save & Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Support & First-Time Access Guide Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">9HR India Portal Access Information</h3>
                <p className="text-xs text-slate-400">Official onboarding guidance for staff & candidates</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>How to Log In</span>
                </h4>
                <p className="text-xs text-slate-300">
                  9HR India operates a unified single-doorway portal. Simply enter your assigned Employee ID, Candidate ID, or official corporate email in the ID field. The secure authentication gateway verifies your record in the Cloud SQL database and automatically directs you to your authorized dashboard.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Corporate Provisioning Credentials</span>
                </h4>
                <p className="text-xs text-slate-300 mb-2">
                  System accounts have been provisioned in the Cloud SQL PostgreSQL database with the standard enterprise temporary password:
                </p>
                <div className="p-2.5 rounded bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 select-all mb-2">
                  Password@9HR2026
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div>• <strong>Candidate:</strong> <code className="text-blue-300">9HR-CAN-2024</code> or <code className="text-blue-300">candidate@9hrindia.com</code></div>
                  <div>• <strong>Recruiter:</strong> <code className="text-blue-300">9HR-REC-201</code> or <code className="text-blue-300">recruiter@9hrindia.com</code></div>
                  <div>• <strong>HR Admin:</strong> <code className="text-blue-300">9HR-ADM-101</code> or <code className="text-blue-300">admin@9hrindia.com</code></div>
                  <div>• <strong>Super Admin:</strong> <code className="text-blue-300">9HR-SA-001</code> or <code className="text-blue-300">superadmin@9hrindia.com</code> (MFA OTP: <code className="text-amber-300">984512</code>)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>HR Helpdesk & Compliance</span>
                </h4>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>onboarding-support@9hrindia.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 (080) 4123-9000 (Mon - Fri, 9:00 AM - 6:00 PM IST)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
