import React, { useState, useEffect, useRef } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  Bell, 
  TrendingUp, 
  Box,
  BrainCircuit,
  Lock,
  Globe,
} from "lucide-react";
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';
import "./LandingPage.css";
import logo from "../assets/logo.png";

// --- Mock Data ---
const CHART_DATA = [
  { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 }, { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 }, { name: 'Fri', value: 500 }, { name: 'Sat', value: 900 },
  { name: 'Sun', value: 700 },
];

const FEATURES = [
  { icon: <BrainCircuit size={28} />, title: "AI Demand Forecasting", desc: "Predict stock requirements with 98% accuracy using our advanced multi-layered neural networks." },
  { icon: <ShieldCheck size={28} />, title: "Smart Supplier Radar", desc: "Detect vendor risks before they impact your supply chain with automated performance screening." },
  { icon: <Zap size={28} />, title: "Real-time Sync Engine", desc: "Experience sub-50ms latency across global depots with our optimized distributed database sync." },
  { icon: <Layers size={28} />, title: "Warehouse Heatmaps", desc: "Visualize storage efficiency and bottleneck areas with real-time 3D topographic mapping." },
  { icon: <Bell size={28} />, title: "Intelligent Alerts", desc: "Context-aware notification system that filters noise and highlights critical inventory shifts." },
  { icon: <TrendingUp size={28} />, title: "Margin Optimization", desc: "Automatically calculate COGS and capital tied in slow-moving stock to maximize liquidity." }
];

// --- Sub Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`navbar-fixed ${scrolled ? "navbar-scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="nav-logo" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
        <img src={logo} alt="S Logo" className="logo-img" />
        <h2>SANGRAHAK</h2>
      </div>
      <div className="nav-links">
        <a href="#platform" className="nav-link">Platform</a>
        <a href="#workflow" className="nav-link">Intelligence</a>
        <a href="#security" className="nav-link">Security</a>
      </div>
      <div className="nav-cta">
        <button onClick={() => window.location.href='/login'}>Get Started</button>
      </div>
    </motion.nav>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div 
      ref={cardRef}
      className="feature-card"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="spotlight-mask"></div>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </motion.div>
  );
};

// --- Landing Page ---

export default function LandingPage() {
  const rootRef = useRef(null);

  const handleGlobalMouseMove = (e) => {
    if (!rootRef.current) return;
    rootRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
    rootRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
  };

  return (
    <div className="landing-root" ref={rootRef} onMouseMove={handleGlobalMouseMove}>
      <div className="cursor-glow"></div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-glow-blob blob-1"></div>
        <div className="hero-glow-blob blob-2"></div>
        
        <div className="hero-left">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="hero-heading">
              <span>Total Inventory</span>
              <span className="text-gradient">Control</span>
              <span>Powered by AI</span>
            </h1>
            <p className="hero-sub">
              SANGRAHAK orchestrates supply chain complexity, predicts demand with surgical precision,
              and tracks assets in real-time across global depots.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => window.location.href='/login'}>
                Get Started
              </button>
              <button className="btn-secondary">View Demo</button>
            </div>
          </motion.div>
        </div>

        <div className="hero-right">
          {/* Floating KPI Cards */}
          <motion.div 
            className="floating-kpi"
            style={{ top: '10%', left: '5%' }}
            animate={{ y: [0, -25, 0], rotate: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="kpi-label">Inventory Accuracy</div>
            <div className="kpi-value text-gradient">98.7%</div>
          </motion.div>

          <motion.div 
            className="floating-kpi"
            style={{ top: '40%', right: '10%' }}
            animate={{ y: [0, 25, 0], rotate: [0, -1, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="kpi-label">Real-Time Stock Value</div>
            <div className="kpi-value">₹2.4 Cr</div>
          </motion.div>

          <motion.div 
            className="floating-kpi"
            style={{ bottom: '15%', left: '15%' }}
            animate={{ y: [0, -20, 0], rotate: [0, 0.5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="kpi-label">Prediction Confidence</div>
            <div className="kpi-value">92%</div>
          </motion.div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="modules-container" id="platform">
        <div style={{ textAlign: 'center', marginBottom: 100 }}>
          <h2 className="hero-heading" style={{ fontSize: '3.5rem', marginBottom: 20 }}>Enterprise Capabilities</h2>
          <p className="hero-sub" style={{ margin: '0 auto' }}>Autonomous logistics powered by neural decision engines.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={i} {...feat} />
          ))}
        </div>
      </section>

      {/* Product Preview Section (Replacing Heatmap/Modules) */}
      <section className="product-preview-container" id="modules">
        <div className="preview-grid">
          <motion.div 
            className="preview-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="preview-tag">Inventory Intelligence</span>
            <h2 className="preview-heading">Smarter Inventory Management with AI</h2>
            <p className="preview-desc">
              SANGRAHAK uses predictive intelligence to monitor stock levels,
              detect supply chain risks, and automate procurement decisions
              across multiple depots.
            </p>
            <div className="hero-cta" style={{ gap: 20 }}>
              <button className="btn-primary" onClick={() => window.location.href='/login'}>
                Get Started
              </button>
              <button className="btn-secondary">View Demo</button>
            </div>
          </motion.div>

          <div className="preview-right">
            <div className="preview-card-stack">
              {/* Back Card */}
              <motion.div 
                className="back-card"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [3, 2, 3]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />

              {/* Main Card */}
              <motion.div 
                className="main-card"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.4 }
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Inventory Health */}
                <div className="card-component">
                  <div className="component-label">
                    <Box size={14} /> Inventory Health
                  </div>
                  <div className="health-val text-gradient">98.7%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--emerald)' }}>Accuracy +2.4% vs LW</div>
                </div>

                {/* Stock Forecast */}
                <div className="card-component">
                  <div className="component-label">
                    <TrendingUp size={14} /> Stock Forecast
                  </div>
                  <div className="forecast-mini">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA.slice(0, 5)}>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="var(--primary-mid)" 
                          fill="var(--primary-glow)" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Smart Alerts */}
                <div className="card-component" style={{ gridColumn: 'span 2' }}>
                  <div className="component-label">
                    <Bell size={14} /> Smart Alerts
                  </div>
                  <div className="alert-item">
                    <div className="dot" style={{ background: 'var(--danger)' }}></div>
                    <span>Supplier delay risk detected (Zenith Global)</span>
                  </div>
                  <div className="alert-item">
                    <div className="dot" style={{ background: 'var(--amber)' }}></div>
                    <span>Reorder recommended in 4 days (Depot A)</span>
                  </div>
                </div>

                {/* Depot Activity Overlay (Pseudo Component) */}
                <div style={{ 
                  gridColumn: 'span 2', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0 10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <div className="dot" style={{ background: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }}></div>
                     Active Depots: 24
                   </div>
                   <span>Live Updates Enabled</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* Autonomous Workflow Section */}
      <section className="workflow-container" id="workflow">
        <div style={{ textAlign: 'center' }}>
          <span className="preview-tag">The Process</span>
          <h2 className="preview-heading" style={{ fontSize: '3rem' }}>How SANGRAHAK Optimizes</h2>
          <p className="preview-desc" style={{ margin: '0 auto' }}>From raw data to autonomous orchestration in three distinct layers.</p>
        </div>

        <div className="workflow-steps">
          {[
            { 
              icon: <Zap size={32} />, 
              title: "Unified Ingestion", 
              desc: "Seamlessly aggregates data from ERPs, hardware sensors, and global transport APIs into a single source of truth." 
            },
            { 
              icon: <BrainCircuit size={32} />, 
              title: "Neural Analysis", 
              desc: "Our predictive engine identifies patterns, predicts demand spikes, and flags potential supply chain bottlenecks." 
            },
            { 
              icon: <Layers size={32} />, 
              title: "Smart Orchestration", 
              desc: "Automatically moves stock, adjusts reorder points, and alerts stakeholders before issues even manifest." 
            }
          ].map((step, i) => (
            <motion.div 
              key={i}
              className="workflow-step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className="step-icon-wrap">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="modules-container">
        <div className="cta-box">
          <h2>Start Managing Inventory <span className="text-gradient">Intelligently</span></h2>
          <div className="hero-cta" style={{ justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => window.location.href='/login'}>
                Get Started Now
            </button>
            <button className="btn-secondary">
                Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Security & Scale Section */}
      <section className="product-preview-container" id="security">
        <div style={{ textAlign: 'center' }}>
          <span className="preview-tag">Infrastructure</span>
          <h2 className="preview-heading" style={{ fontSize: '3rem' }}>Engineered for the Enterprise</h2>
          <p className="preview-desc" style={{ margin: '0 auto' }}>SANGRAHAK provides the reliability and security required by global supply chain leaders.</p>
        </div>

        <div className="security-grid">
          {[
            { 
              icon: <Lock size={24} />, 
              title: "Military-Grade Security", 
              desc: "Full AES-256 encryption at rest and in transit, with SOC2-compliant access controls." 
            },
            { 
              icon: <Globe size={24} />, 
              title: "Global Sync Hub", 
              desc: "Distributed architecture ensures sub-50ms latency across global depots and warehouses." 
            },
            { 
              icon: <ShieldCheck size={24} />, 
              title: "99.99% Uptime SLA", 
              desc: "Redundant clusters and autonomous failover mechanisms ensure zero-downtime operations." 
            },
            { 
              icon: <Zap size={24} />, 
              title: "Real-Time ERP Link", 
              desc: "Seamlessly bridges SAP, Oracle, and Microsoft Dynamics with dedicated AI hooks." 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="security-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="security-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 20, letterSpacing: '-1.5px' }}>SANGRAHAK</h2>
            <p className="feature-desc" style={{ maxWidth: 320 }}>
              The autonomous intelligence engine for modern logistics and enterprise asset orchestration.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#">Features</a><a href="#">Security</a><a href="#">API</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Docs</a><a href="#">Status</a><a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy</a><a href="#">Terms</a>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: 40, display: 'flex', justifyContent: 'space-between' }}>
          <span>© {new Date().getFullYear()} SANGRAHAK Inc.</span>
          <div style={{ display: 'flex', gap: 32 }}><span>Twitter</span><span>LinkedIn</span><span>GitHub</span></div>
        </div>
      </footer>
    </div>
  );
}
