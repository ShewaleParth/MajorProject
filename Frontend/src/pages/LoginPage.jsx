import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './LoginPage.css';

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthVars = ['#EF4444', '#F59E0B', '#EAB308', '#10B981'];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, verifyOTP, forgotPassword } = useAuth();
  
  // State 0: 'login', 1: 'signup', 2: 'forgot', 3: 'otp'
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successState, setSuccessState] = useState(false);

  useEffect(() => {
    // parse ?tab=signup from URL
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['login', 'signup', 'forgot', 'otp'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Forms data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpSentTo, setOtpSentTo] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const calculateStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const pwStrength = calculateStrength(formData.password);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client Validation
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.firstName.length < 2) {
      setError('First name must be at least 2 characters');
      return;
    }
    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      setError('Password must be at least 8 characters and contain a number');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(formData.firstName, formData.lastName, formData.email, formData.password, formData.confirmPassword);
    if (result.success) {
      // successful signup triggers auto verification step or just auto-login
      const loginRes = await login(formData.email, formData.password);
      if (loginRes.success) {
        navigate('/dashboard');
      } else {
        setActiveTab('login');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(formData.email);
    if (result.success) {
      setOtpSentTo(formData.email);
      setActiveTab('otp');
      setResendTimer(60);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    let t;
    if (resendTimer > 0 && activeTab === 'otp') {
      t = setInterval(() => setResendTimer(r => r - 1), 1000);
    }
    return () => clearInterval(t);
  }, [resendTimer, activeTab]);

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setError('');

    if (val && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    
    // Auto submit check
    if (val && index === 5 && newOtp.every(d => d !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const past = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (!past) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < past.length; i++) {
      newOtp[i] = past[i];
    }
    setOtp(newOtp);
    
    if (past.length === 6) {
      otpRefs.current[5].focus();
      submitOtp(newOtp.join(''));
    } else {
      otpRefs.current[past.length].focus();
    }
  };

  const submitOtp = async (code) => {
    setLoading(true);
    const result = await verifyOTP(otpSentTo, code);
    if (result.success) {
      setSuccessState(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message || 'Invalid code');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0].focus();
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    await forgotPassword(otpSentTo || formData.email);
    setResendTimer(60);
    setLoading(false);
  };

  return (
    <div className="auth-page-root">
      {/* Left Panel */}
      <div className="auth-visual-panel">
        <div className="auth-visual-bg">
          <div className="bg-glow orb-1"></div>
          <div className="bg-glow orb-2"></div>
          
          <div className="data-flow-viz">
            <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
                  <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <path id="path1" d="M -100 600 Q 200 400 300 400 T 600 200 T 900 100" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 6"/>
              <path id="path2" d="M -50 200 C 150 200 250 350 400 300 S 650 400 900 350" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
              <path id="path3" d="M 200 800 L 250 450 L 500 400 L 700 -50" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />

              <circle r="5" fill="#38BDF8" filter="url(#glow)">
                <animateMotion dur="8s" repeatCount="indefinite">
                  <mpath href="#path1"/>
                </animateMotion>
              </circle>
              <circle r="3" fill="#fff" filter="url(#glow)">
                <animateMotion dur="12s" begin="2s" repeatCount="indefinite">
                  <mpath href="#path1"/>
                </animateMotion>
              </circle>
              
              <circle r="6" fill="#60A5FA" filter="url(#glow)">
                <animateMotion dur="11s" repeatCount="indefinite">
                  <mpath href="#path2"/>
                </animateMotion>
              </circle>
              
              <circle r="4" fill="#38BDF8" filter="url(#glow)">
                <animateMotion dur="7s" begin="3s" repeatCount="indefinite">
                  <mpath href="#path3"/>
                </animateMotion>
              </circle>

              <g transform="translate(300, 400)">
                <circle cy="0" cx="0" r="28" fill="rgba(37,99,235,0.1)"/>
                <circle cy="0" cx="0" r="14" fill="#030712" stroke="#2563EB" strokeWidth="3"/>
                <circle cy="0" cx="0" r="5" fill="#38BDF8" filter="url(#glow)"/>
                <circle cy="0" cx="0" r="24" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0">
                  <animate attributeName="r" values="14; 45; 45" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8; 0; 0" dur="3s" repeatCount="indefinite" />
                </circle>
              </g>

              <g transform="translate(600, 200)">
                <circle cy="0" cx="0" r="34" fill="rgba(14,165,233,0.1)"/>
                <circle cy="0" cx="0" r="18" fill="#030712" stroke="#0EA5E9" strokeWidth="3"/>
                <circle cy="0" cx="0" r="6" fill="#fff" filter="url(#glow)"/>
                <circle cy="0" cx="0" r="32" fill="none" stroke="#0EA5E9" strokeWidth="2" opacity="0">
                  <animate attributeName="r" values="18; 55; 55" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6; 0; 0" dur="4s" repeatCount="indefinite" />
                </circle>
              </g>

              <g transform="translate(400, 300)">
                <circle cy="0" cx="0" r="10" fill="#030712" stroke="#38BDF8" strokeWidth="2"/>
                <circle cy="0" cx="0" r="3" fill="#fff" filter="url(#glow)"/>
              </g>
              
              <g transform="translate(250, 450)">
                <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#030712" stroke="#2563EB" strokeWidth="2"/>
                <circle cy="0" cx="0" r="2" fill="#38BDF8" />
              </g>
              
              <g transform="translate(500, 400)">
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#030712" stroke="#0EA5E9" strokeWidth="2"/>
                <circle cy="0" cx="0" r="3" fill="#fff"/>
              </g>
            </svg>
          </div>
        </div>
        <Link to="/" className="auth-logo-brand">
          <div className="auth-logo-icon">S</div> SANGRAHAK
        </Link>
        <div className="auth-visual-content">
          <h2>Intelligence <br/>for Inventory.</h2>
          <p>The enterprise standard for AI-assisted logistics, accurate forecasting, and depot-wide stock visibility.</p>
        </div>
        <div className="auth-metrics-preview">
          <div className="metric-pill">
            <span className="lbl">Accuracy</span>
            <span className="val">99.9%</span>
          </div>
          <div className="metric-pill">
            <span className="lbl">Response Rate</span>
            <span className="val">&lt;50ms</span>
          </div>
        </div>
        <div className="auth-testimonial">
          "SANGRAHAK halved our forecasting variance in 3 months."
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-form-panel">
        <div className="mobile-logo-header">
          <div className="auth-logo-icon" style={{ width: '28px', height: '28px', fontSize: '14px' }}>S</div> 
          SANGRAHAK
        </div>

        <div className="auth-form-wrapper" key={activeTab}>
          
          {error && (
            <div className="error-banner">
              {error}
              <button type="button" onClick={() => setError('')}>&times;</button>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="auth-form-header">
                <h1>Sign In</h1>
                <p>Welcome back to your logistics dashboard.</p>
              </div>
              
              <div className="form-group">
                <Mail className="input-icon-left" size={20} />
                <input 
                  type="email" 
                  name="email" 
                  className="form-input" 
                  placeholder="Email address" 
                  value={formData.email} 
                  onChange={handleChange}
                  onBlur={() => {}}
                />
              </div>
              <div className="form-group">
                <Lock className="input-icon-left" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  className="form-input" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); setActiveTab('forgot'); }}>Forgot password?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <div className="spinner-svg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div> : 'Sign In'}
              </button>

              <div className="auth-bottom">
                Don't have an account? <button type="button" onClick={() => setActiveTab('signup')}>Create one</button>
              </div>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit}>
              <button type="button" className="auth-back-button" onClick={() => setActiveTab('login')}><ArrowLeft size={16}/> Back to login</button>
              <div className="auth-form-header">
                <h1>Create Account</h1>
                <p>Join SANGRAHAK to manage your depots.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <User className="input-icon-left" size={20} />
                  <input type="text" name="firstName" className="form-input" placeholder="First name" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <input type="text" name="lastName" className="form-input" style={{ paddingLeft: '16px' }} placeholder="Last name" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <Mail className="input-icon-left" size={20} />
                <input type="email" name="email" className="form-input" placeholder="Email address" value={formData.email} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <Lock className="input-icon-left" size={20} />
                <input type={showPassword ? 'text' : 'password'} name="password" className="form-input" placeholder="Password (min 8 char)" value={formData.password} onChange={handleChange} />
                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {formData.password && (
                  <>
                    <div className="strength-bar-container">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="strength-segment" style={{ background: i <= pwStrength ? strengthVars[pwStrength-1] : '#E2E8F0' }}></div>
                      ))}
                    </div>
                    <div className="strength-lbl" style={{ color: strengthVars[pwStrength-1] }}>{strengthLabels[pwStrength-1] || 'Weak'}</div>
                  </>
                )}
              </div>

              <div className="form-group">
                <Lock className="input-icon-left" size={20} />
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                   <CheckCircle2 className="input-icon-right" size={20} color="#10B981" style={{ pointerEvents: 'none' }} />
                )}
              </div>

              <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? <div className="spinner-svg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div> : 'Create Account'}
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit}>
              <button type="button" className="auth-back-button" onClick={() => setActiveTab('login')}><ArrowLeft size={16}/> Back to login</button>
              <div className="auth-form-header">
                <h1>Reset your password</h1>
                <p>Enter your email and we'll send a 6-digit OTP.</p>
              </div>
              
              <div className="form-group">
                <Mail className="input-icon-left" size={20} />
                <input type="email" name="email" className="form-input" placeholder="Email address" value={formData.email} onChange={handleChange} />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <div className="spinner-svg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div> : 'Send Reset Code'}
              </button>
            </form>
          )}

          {activeTab === 'otp' && (
            <div>
              {successState ? (
                <div className="success-overlay">
                  <CheckCircle2 size={48} />
                  <div>Verified! Redirecting...</div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); submitOtp(otp.join('')); }}>
                  <button type="button" className="auth-back-button" onClick={() => setActiveTab('forgot')}><ArrowLeft size={16}/> Change email</button>
                  <div className="auth-form-header">
                    <h1>Verify your identity</h1>
                    <p>We sent a 6-digit code to <strong>{otpSentTo || formData.email}</strong></p>
                  </div>
                  
                  <div className="otp-container">
                    {otp.map((d, i) => (
                      <input 
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`otp-box ${error ? 'error' : ''}`}
                        value={d}
                        ref={el => otpRefs.current[i] = el}
                        onChange={(e) => handleOtpChange(e, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        onPaste={handleOtpPaste}
                      />
                    ))}
                  </div>

                  <button type="submit" style={{ display: 'none' }}></button>

                  <div className="auth-bottom" style={{ marginTop: '0' }}>
                    {resendTimer > 0 ? (
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>Resend code in {resendTimer}s</span>
                    ) : (
                      <button type="button" onClick={handleResendOtp} disabled={loading}>Resend code</button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
