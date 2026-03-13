import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useNeuralNet } from "../hooks/useNeuralNet";
import { LoginForm, SignupForm, ForgotForm, OTPForm } from "./AuthForms";
import logo from "../assets/logo.png";
import "./LoginPage.css";

const VIEWS = {
  login:  LoginForm,
  signup: SignupForm,
  forgot: ForgotForm,
  otp:    OTPForm,
};

export default function LoginPage() {
  const [view,   setView]  = useState("login");
  const [email,  setEmail] = useState("");

  const canvasContainerRef = React.useRef(null);
  const canvasRef = useNeuralNet(canvasContainerRef);

  const Component = VIEWS[view];

  return (
    <div className="login-layout">
      {/* 3.2 Left Panel (Neural Net) */}
      <div className="canvas-side" ref={canvasContainerRef}>
        <canvas ref={canvasRef}></canvas>
        <div className="login-logo">
          <img src={logo} alt="SANGRAHAK Logo" className="logo-img" />
          SANGRAHAK
        </div>
        <div className="canvas-overlay">
          <h2>Security & Sync</h2>
          <p>
            Your logistics data is encrypted via 256-bit AES <br/>
            and backed up across redundant regional hubs.
          </p>
        </div>
      </div>

      {/* 3.3 Right Panel (Auth Form) */}
      <div className="form-side">
        <div className="form-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Component
                goTo={setView}
                email={email}
                setEmail={setEmail}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
