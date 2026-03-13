import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MODULES } from "../data/modules";
import { DashboardPanel, InventoryPanel, SupplierPanel } from "./Panels";

const panelComponents = {
  DashboardPanel, InventoryPanel, SupplierPanel
};

export default function ModuleDemo() {
  const [active, setActive] = useState("dashboard");
  const mod = MODULES[active];
  const Panel = panelComponents[mod.panel];

  return (
    <div className="modules-layout">
      {/* Left: Tabs */}
      <div className="module-tabs">
        {Object.entries(MODULES).map(([key, m], i) => (
          <div
            key={key}
            className={`mod-tab ${active === key ? "active" : ""}`}
            onClick={() => setActive(key)}
          >
            <span className="mod-num">0{i + 1}</span>
            <div>
              <div className="mod-title">{m.title}</div>
              <AnimatePresence>
                {active === key && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <motion.p
                      className="mod-desc"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {m.desc}
                    </motion.p>
                    <motion.div
                      className="mod-metrics"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      {m.metrics.map(pill => (
                        <span key={pill} className="mod-pill">{pill}</span>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Display panel with animated swap */}
      <div className="mod-display">
        <div className="mod-topbar">
          <span className="dot red"/><span className="dot yellow"/><span className="dot green"/>
          <span className="mod-label">{mod.title}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="mod-panel-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Panel />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
