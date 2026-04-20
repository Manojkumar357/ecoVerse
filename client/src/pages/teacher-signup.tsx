// Helper input components
function LabeledInput({ label, value, onChange, onBlur, helper, type, disabled }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; helper?: string; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={value} onChange={onChange} onBlur={onBlur} type={type} disabled={disabled} />
      {helper && <span className="block text-xs text-earth-muted mt-1">{helper}</span>}
    </label>
  );
}

function PhotoInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input type="file" accept="image/*" onChange={onFile} className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white" />
      {value && <img src={value} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full" />}
    </label>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SignupAnimatedBackground from "@/components/SignupAnimatedBackground";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function TeacherSignupWizard() {
  const { setRole } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    id: "",
    username: "",
    schoolId: "",
    subject: "",
    photoDataUrl: "",
  password: "",
  confirmPassword: "",
  });
  const [usernameStatus, setUsernameStatus] = useState<"unknown" | "checking" | "available" | "taken">("unknown");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState<'valid' | 'invalid' | 'pending'>('pending');
  const completionChecks = [
    form.name.trim(),
    form.email.trim(),
    form.id.trim(),
    form.username.trim() && usernameStatus === 'available',
    form.schoolId.trim(),
    form.subject.trim(),
    form.password && form.password.length >= 6,
    form.confirmPassword === form.password && form.confirmPassword.length > 0,
    otpCode.replace(/\D/g, '').length === 6 && otpStatus === 'valid',
  ];
  const completedFields = completionChecks.filter(Boolean).length;
  const completionPercent = Math.round((completedFields / completionChecks.length) * 100);
  
  // Validate OTP in real-time when 6 digits are entered
  useEffect(() => {
    const sanitized = otpCode.replace(/\D/g, '');
    if (sanitized.length === 6) {
      const verifyOtp = async () => {
        try {
          const res = await fetch('/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, code: sanitized })
          }).then(r => r.json());
          setOtpStatus(res.ok ? 'valid' : 'invalid');
        } catch {
          setOtpStatus('invalid');
        }
      };
      verifyOtp();
    } else {
      setOtpStatus('pending');
    }
  }, [otpCode, form.email]);
  
  const isFormComplete = () => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.id.trim() &&
      form.username.trim() &&
      usernameStatus === 'available' &&
      form.schoolId.trim() &&
      form.subject.trim() &&
      form.password && form.password.length >= 6 &&
      form.confirmPassword === form.password &&
      otpCode.replace(/\D/g, '').length === 6
    );
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  async function checkUsername() {
    if (!form.username) return;
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/username-available/${encodeURIComponent(form.username)}`).then(r => r.json());
      setUsernameStatus(res.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('unknown');
    }
  }

  async function requestOtp() {
    if (!form.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await fetch('/api/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
      const data = await res.json();
      if (data.ok) {
        toast({
          title: 'OTP Sent',
          description: `OTP code sent to ${form.email}. Check your inbox.`,
        });
        setOtpSent(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const submit = async () => {
    // Validate all required fields
    const missingFields: string[] = [];
    if (!form.name.trim()) missingFields.push('Full Name');
    if (!form.email.trim()) missingFields.push('Email');
    if (!form.id.trim()) missingFields.push('Teacher ID');
    if (!form.username.trim()) missingFields.push('Username');
    if (usernameStatus !== 'available') missingFields.push('Available Username (click Check Username)');
    if (!form.schoolId.trim()) missingFields.push('School/College Name');
    if (!form.subject.trim()) missingFields.push('Subject');
    if (!form.password || form.password.length < 6) missingFields.push('Password (minimum 6 characters)');
    if (form.password !== form.confirmPassword) missingFields.push('Password Confirmation (must match password)');
    
    const sanitized = otpCode.replace(/\D/g, '').slice(0, 6);
    if (sanitized.length !== 6 || otpStatus !== 'valid') missingFields.push('Valid 6-digit OTP Code');
    
    if (missingFields.length > 0) {
      toast({
        title: 'Incomplete Form',
        description: `Please fill in: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : ''}`,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    // OTP is already verified in real-time, so we can proceed directly to signup
    await fetch('/api/signup/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        username: form.username,
        schoolId: form.schoolId,
        id: form.id,
        subject: form.subject,
        photoDataUrl: form.photoDataUrl,
        password: form.password,
      })
    });
    setSubmitting(false);
    toast({
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully. Please wait for admin approval.',
    });
    setTimeout(() => navigate('/signin'), 2000);
  };

  return (
    <SignupAnimatedBackground>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 -right-20 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30 transform hover:scale-[1.005] transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-400 to-emerald-500 p-4 rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">Join EcoVerse as a Teacher</h1>
            <p className="text-gray-700 text-lg">Shape the future of environmental education</p>
            <div className="mt-5 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
                <span>Application Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to role selection
            </button>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Example: Jane Smith</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    disabled={otpSent}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white disabled:opacity-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">OTP will be sent to this email</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Teacher ID</label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="Enter your teacher ID"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set your own unique ID</p>
                </div>
              </div>
            </div>

            {/* Account Setup */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:border-purple-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Account Setup
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Unique Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onBlur={checkUsername}
                    placeholder="Choose a unique username"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">This must be unique. Example: jane_smith_01</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={checkUsername}
                    disabled={!form.username || usernameStatus === 'checking'}
                    className="px-6 py-2 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                  >
                    {usernameStatus === 'checking' ? 'Checking...' : 'Check Username'}
                  </Button>
                  {usernameStatus === 'available' && (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Taken
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Create password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                    />
                    <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:border-green-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">School</label>
                  <input
                    type="text"
                    value={form.schoolId}
                    onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                    placeholder="Enter your school/college name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Type your school or college name.</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Enter your subject"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Example: Mathematics, Science, Environmental Studies</p>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:border-orange-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                Profile Photo
              </h2>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Upload Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm({ ...form, photoDataUrl: String(reader.result || "") });
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {form.photoDataUrl && (
                  <div className="mt-4 flex justify-center">
                    <img src={form.photoDataUrl} alt="Preview" className="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Email Verification */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 hover:border-red-300 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                Email Verification
              </h2>
              <p className="text-gray-600 mb-4">We'll send a one-time code to your email for verification.</p>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={requestOtp}
                    disabled={!form.email || otpSent}
                    className="px-6 py-3 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    {otpSent ? 'OTP Sent' : 'Send OTP to Email'}
                  </Button>
                  {otpSent && (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        maxLength={6}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white text-center text-lg font-mono"
                      />
                      {otpCode.replace(/\D/g, '').length === 6 && (
                        otpStatus === 'valid' ? (
                          <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      )}
                    </div>
                  )}
                </div>
                {otpSent && (
                  <p className="text-sm text-gray-600">
                    OTP sent to: <span className="font-medium text-gray-800">{form.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-blue-500 to-emerald-600 rounded-2xl p-6 text-white">
              <Button
                onClick={submit}
                disabled={submitting || !isFormComplete()}
                className="w-full py-4 bg-white text-blue-600 hover:bg-gray-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <p className="mt-4 text-center text-blue-100 text-sm">
                After submission, your application will be pending until an admin approves it.
              </p>
              {!isFormComplete() && (
                <p className="mt-2 text-center text-blue-100/90 text-xs">
                  Complete all fields and verify OTP to enable submission.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SignupAnimatedBackground>
  );
}
