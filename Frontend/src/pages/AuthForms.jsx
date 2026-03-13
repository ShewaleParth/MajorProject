import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordStrength } from "../components/PasswordStrength";
import { OTPInput } from "../components/OTPInput";
import { ErrorBanner } from "../components/ErrorBanner";
import { isValidEmail } from "../utils/validation";
import { useAuth } from "../context/AuthContext";

export function LoginForm({ goTo, email, setEmail }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Invalid email address");
    if (!password) return setError("Password is required");
    setError("");
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Welcome Back</h2>
      <p className="auth-sub">Enter your details to access your account.</p>
      
      <ErrorBanner show={!!error} message={error} />

      <div className="input-group">
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
      </div>

      <div className="form-actions-row">
        <span className="text-link" onClick={() => goTo("forgot")}>Forgot Password?</span>
      </div>

      <button type="submit" className="btn-auth">Sign In</button>

      <p className="auth-switch">
        Don't have an account? <span onClick={() => goTo("signup")}>Sign Up</span>
      </p>
    </form>
  );
}

export function SignupForm({ goTo, email, setEmail }) {
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return setError("Name is required");
    if (!isValidEmail(email)) return setError("Invalid email address");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setError("");
    
    // confirmPassword uses the same password for now since there's only one input in the UI
    const res = await signup(firstName, lastName, email, password, password);
    if (!res.success) {
      setError(res.message);
    } else {
      goTo("otp");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      <p className="auth-sub">Join NexusStock and transform your logistics.</p>

      <ErrorBanner show={!!error} message={error} />

      <div className="name-row">
        <div className="input-group">
          <label>First Name</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
        </div>
        <div className="input-group">
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
        </div>
      </div>

      <div className="input-group">
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" />
        <PasswordStrength password={password} />
      </div>

      <button type="submit" className="btn-auth">Create Account</button>

      <p className="auth-switch">
        Already have an account? <span onClick={() => goTo("login")}>Sign In</span>
      </p>
    </form>
  );
}

export function ForgotForm({ goTo, email, setEmail }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Invalid email address");
    setError("");
    
    const res = await forgotPassword(email);
    if (!res.success) {
      setError(res.message);
    } else {
       setSent(true);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <p className="auth-sub">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <div className="success-banner">
          Check your email for instructions to reset your password.
        </div>
      ) : (
        <>
          <ErrorBanner show={!!error} message={error} />
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <button type="submit" className="btn-auth">Send Reset Link</button>
        </>
      )}

      <p className="auth-switch center-text">
        <span onClick={() => goTo("login")}>← Back to Login</span>
      </p>
    </form>
  );
}

export function OTPForm({ goTo, email }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return setError("Please enter the full 6-digit code.");
    setError("");
    
    const res = await verifyOTP(email, otp);
    if (!res.success) {
      setError(res.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Verify Email</h2>
      <p className="auth-sub">We sent a 6-digit code to <strong>{email || "your email"}</strong>.</p>

      <ErrorBanner show={!!error} message={error} />

      <div className="input-group" style={{ alignItems: "center" }}>
        <OTPInput value={otp} onChange={setOtp} />
      </div>

      <button type="submit" className="btn-auth">Verify Account</button>

      <p className="auth-switch center-text">
        Didn't receive code? <span onClick={() => goTo("login")}>Back to login</span>
      </p>
    </form>
  );
}
