// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const shake = {
  initial: { opacity: 0, y: -6 },
  animate: {
    opacity: 1, y: 0,
    x: [0, -6, 6, -4, 4, 0],    // shake keyframes
    transition: {
      opacity: { duration: 0.2 },
      x: { duration: 0.4, ease: "easeInOut" },
    },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2 } },
};

export function ErrorBanner({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="error-banner" {...shake}>
          <span>⚠</span> {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
