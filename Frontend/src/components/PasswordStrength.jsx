// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { getPasswordStrength, STRENGTH_LABELS, STRENGTH_COLORS } from "../utils/validation";

export function PasswordStrength({ password }) {
  const level  = getPasswordStrength(password);
  const color  = STRENGTH_COLORS[level];
  const label  = STRENGTH_LABELS[level];

  return (
    <div className="strength-wrap">
      <div className="strength-bar">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="strength-seg"
            animate={{ background: i < level ? color : "rgba(255,255,255,0.08)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color }}>
        {password ? label : "Enter a password"}
      </span>
    </div>
  );
}
