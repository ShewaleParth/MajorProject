// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export function KPICard({ icon, label, value, change, changeType, barFill, barColor, delay, className }) {
  return (
    <motion.div
      className={`kpi-card ${className}`}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -6, boxShadow: "0 14px 44px rgba(0,0,0,0.5)" }}
    >
      <div className={`kpi-icon ${icon.bg}`}>{icon.emoji}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-change ${changeType}`}>{change}</div>
      <div className="kpi-bar">
        <motion.div
          className={`kpi-bar-fill ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${barFill}%` }}
          transition={{ duration: 1.5, delay: delay + 0.4, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
