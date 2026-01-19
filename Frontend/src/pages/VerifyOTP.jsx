import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import './Auth.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, signup } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    const result = await verifyOTP(email, otp);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    // Resend OTP by calling signup again with the same email
    // This will trigger a new OTP to be sent
    const result = await signup('', '', email, '');

    if (result.success) {
      setSuccess('New OTP sent to your email!');
    } else {
      setError('Failed to resend OTP. Please try again.');
    }

    setResending(false);
  };

  return (
    <div className="auth-container-centered">
      <div className="auth-card-modern">
        <div className="auth-form-header">
          <h2>Verify Your Email</h2>
          <p>
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-modern">
          {error && (
            <div className="error-message-modern">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message-modern">
              <span className="success-icon">✓</span>
              {success}
            </div>
          )}

          <div className="form-group-modern">
            <label htmlFor="otp">Verification Code</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={20} />
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="000000"
                maxLength="6"
                className="otp-input-modern"
                required
              />
            </div>
            <small className="input-hint">Enter the 6-digit code from your email</small>
          </div>

          <button type="submit" className="auth-button-modern" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-modern"></span>
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="resend-section-modern">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              className="resend-button-modern"
              disabled={resending}
            >
              <RefreshCw size={16} className={resending ? 'spinning' : ''} />
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </form>

        <div className="auth-footer-modern">
          <Link to="/signup" className="auth-link-modern back-link">
            <ArrowLeft size={16} />
            Back to signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
