export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function getPasswordStrength(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(Math.floor(score * 0.9), 4);
}

export const STRENGTH_LABELS = ["Too Weak", "Weak", "Fair", "Strong", "Very Strong"];
export const STRENGTH_COLORS = ["#ff3e78", "#ff8c00", "#ffc800", "#00dc82", "#00dc82"];
