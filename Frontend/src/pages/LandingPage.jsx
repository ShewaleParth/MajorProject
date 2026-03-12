import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Search, FileText, Activity, ShieldAlert, Cpu } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => navigate('/login');
  const handleGetStarted = () => navigate('/login?tab=signup');
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const modulesData = {
    dashboard: {
      title: 'Executive Dashboard',
      description: 'A comprehensive operational overview with real-time tracking, KPI cards, and critical alerts at your fingertips.',
      metrics: [
        { label: 'Latency', value: '120ms' },
        { label: 'Insights', value: '2.4M' },
        { label: 'Uptime', value: '99.9%' }
      ]
    },
    inventory: {
      title: 'Total Inventory Control',
      description: 'Track stock levels, valuation, and movements across all your depots with AI-driven categorisation and forecasting.',
      metrics: [
        { label: 'Active SKUs', value: '14,289' },
        { label: 'Accuracy', value: '99.2%' },
        { label: 'Turnover', value: '4.8x' }
      ]
    },
    supplier: {
      title: 'Supplier Risk Radar',
      description: 'Continuous monitoring of supplier performance, delay probabilities, and quality metrics using predictive modeling.',
      metrics: [
        { label: 'Suppliers', value: '184' },
        { label: 'Risk Flags', value: '12' },
        { label: 'Avg Delay', value: '2.1d' }
      ]
    }
  };

  return (
    <div className="landing-page">
      {/* SECTION 1: Navbar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-container nav-content">
          <div className="nav-logo" onClick={scrollToTop}>
            <div className="logo-s">S</div>
            <strong style={{ fontSize: '18px', tracking: '1px' }}>SANGRAHAK</strong>
          </div>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules" className="nav-link">Modules</a>
            <a href="#reports" className="nav-link">Reports</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>

          <div className="nav-cta-group">
            <button className="btn-signin" onClick={handleSignIn}>Sign In</button>
            <button className="btn-primary" onClick={handleGetStarted}>Get Started &rarr;</button>
          </div>
          
          <button className="mobile-menu-btn">☰</button>
        </div>
      </nav>

      {/* SECTION 2: Hero */}
      <section className="hero-section landing-container">
        <div className="hero-copy">
          <div className="hero-badge">
            <Activity size={14} style={{ marginRight: '6px' }} />
            AI-Powered Inventory Intelligence
          </div>
          <h1 className="text-h1">
            Intelligent Logistics,<br />
            <span className="text-gradient">Total Inventory Control</span>
          </h1>
          <p className="hero-subtext">
            Transform your supply chain with predictive insights, real-time tracking, and automated risk assessment designed for enterprise scale.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary btn-hero" onClick={handleGetStarted}>Start Free &rarr;</button>
            <button className="btn-outline btn-hero" style={{ paddingLeft: '32px', paddingRight: '32px' }} onClick={handleSignIn}>Watch Demo &#9654;</button>
          </div>
          <div className="social-proof">
            &#10003; Used by 3 depots &middot; No credit card &middot; MIT License
          </div>
        </div>
        
        <div className="hero-visuals">
          <div className="kpi-card float-1">
            <span className="kpi-label">Total Stock Value</span>
            <span className="kpi-val">&#8377;2.4 Cr</span>
            <span className="kpi-delta delta-pos">&#9650; 12.3% this month</span>
          </div>
          <div className="kpi-card float-2">
            <span className="kpi-label">Active Suppliers</span>
            <span className="kpi-val">19</span>
            <span className="kpi-delta delta-neg">&#9660; 2 at risk</span>
          </div>
          <div className="kpi-card float-3">
            <span className="kpi-label">Forecast Accuracy</span>
            <span className="kpi-val">94.2%</span>
            <span className="kpi-delta delta-pos">&#9650; 1.8% vs last quarter</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Stats Strip */}
      <section className="stats-strip">
        <div className="landing-container stats-grid">
          <div>
            <div className="stat-val">2.4Cr</div>
            <div className="stat-label">Stock Value Analyzed</div>
          </div>
          <div>
            <div className="stat-val">94%</div>
            <div className="stat-label">Forecast Accuracy</div>
          </div>
          <div>
            <div className="stat-val">10ms</div>
            <div className="stat-label">Query Latency</div>
          </div>
          <div>
            <div className="stat-val">24/7</div>
            <div className="stat-label">Supplier Monitoring</div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Features Grid */}
      <section id="features" className="features-section landing-container">
        <div className="section-header">
          <h2>Platform Capabilities</h2>
          <p>Everything you need to manage your logistics operation in one unified platform.</p>
        </div>
        
        <div className="features-grid">
          {[
            { icon: <Network color="#2563EB" />, color: '#2563EB', title: 'Real-time Tracking', desc: 'Monitor depot movements across your entire network precisely instantly.' },
            { icon: <Cpu color="#0EA5E9" />, color: '#0EA5E9', title: 'AI Forecasting', desc: 'Predictive modeling algorithms accurately estimate future demand and reduce stockouts.' },
            { icon: <ShieldAlert color="#F59E0B" />, color: '#F59E0B', title: 'Risk Radar', desc: 'Identify supplier delays and quality degradation before they impact operations.' },
            { icon: <Search color="#10B981" />, color: '#10B981', title: 'Deep Search', desc: 'Find any SKU instantly with our high performance fuzzy search indexing.' },
            { icon: <Activity color="#8B5CF6" />, color: '#8B5CF6', title: 'Live Dashboard', desc: 'Executive metrics beautifully visualised for rapid decision making.' },
            { icon: <FileText color="#EC4899" />, color: '#EC4899', title: 'Export Reports', desc: 'Generate compliance ready PDF and XLSX reports with one click.' },
          ].map((feat, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon-box" style={{ background: `${feat.color}22` }}>
                {feat.icon}
              </div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Modules (Interactive) */}
      <section id="modules" className="modules-section">
        <div className="landing-container">
          <div className="section-header">
            <h2>Deep Dive Modules</h2>
            <p>Purpose built interfaces for every logistics workflow.</p>
          </div>
          
          <div className="modules-tabs">
            {['dashboard', 'inventory', 'supplier'].map((tab) => (
              <div 
                key={tab}
                className={`module-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          
          <div className="module-content-grid">
            <div className="module-info">
              <h3>{modulesData[activeTab].title}</h3>
              <p>{modulesData[activeTab].description}</p>
              <div className="module-metrics">
                {modulesData[activeTab].metrics.map((m, i) => (
                  <div className="mini-metric" key={i}>
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="module-visual">
              <div className="visual-mock">
                 <div style={{ position: 'absolute', bottom: '20%', left: '10%', right: '10%', height: '2px', background: '#334155' }}></div>
                 <div style={{ position: 'absolute', bottom: '20%', left: '20%', height: '40%', width: '4px', background: '#0EA5E9' }}></div>
                 <div style={{ position: 'absolute', bottom: '20%', left: '40%', height: '60%', width: '4px', background: '#0EA5E9' }}></div>
                 <div style={{ position: 'absolute', bottom: '20%', left: '60%', height: '30%', width: '4px', background: '#0EA5E9' }}></div>
                 <div style={{ position: 'absolute', bottom: '20%', left: '80%', height: '50%', width: '4px', background: '#0EA5E9' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA Banner */}
      <section className="cta-banner">
        <div className="landing-container">
          <h2>Ready to upgrade your logistics?</h2>
          <div className="hero-ctas" style={{ justifyContent: 'center' }}>
            <button className="btn-primary btn-hero" onClick={handleGetStarted}>Get Started Free &rarr;</button>
          </div>
        </div>
      </section>

      {/* SECTION 8: Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div className="footer-brand">
               <div className="nav-logo">
                <div className="logo-s">S</div>
                <strong style={{ fontSize: '18px', tracking: '1px' }}>SANGRAHAK</strong>
              </div>
              <p>AI-Powered Logistics Management<br/>System for modern enterprises.</p>
            </div>
            <div>
              <div className="footer-title">Product</div>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#modules">Modules</a></li>
                <li><a href="#reports">Reports</a></li>
                <li><a href="#">API Docs</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Company</div>
              <ul className="footer-links">
                <li><a href="#">GitHub</a></li>
                <li><a href="#">License</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Tech</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#1E293B', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#94A3B8' }}>React</span>
                <span style={{ background: '#1E293B', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#94A3B8' }}>Node.js</span>
                <span style={{ background: '#1E293B', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#94A3B8' }}>Python</span>
                <span style={{ background: '#1E293B', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#94A3B8' }}>MongoDB</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} SANGRAHAK Logistics Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
