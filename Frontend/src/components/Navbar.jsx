import React from "react";
import { useScrolled } from "../hooks/useScrolled";

export default function Navbar() {
  const scrolled = useScrolled(20);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <a href="/" className="nav-logo">
        <div className="logo-box">S</div>
        SANGRAHAK
      </a>

      <div className="nav-links-pill">
        {["Main", "About", "Platform", "Roadmap"].map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} className="nav-link">{link}</a>
        ))}
      </div>

      <a href="/login" className="nav-cta">Get Started →</a>
    </nav>
  );
}
