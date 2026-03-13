import { useRef } from "react";

export function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleInput = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const newVal = value.split("");
    newVal[idx] = val;
    onChange(newVal.join(""));
    // Auto-focus next on type
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    // Backspace navigation to previous input
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    // Smart clipboard paste
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, " ").slice(0, 6).trim());
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-wrap">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-input ${value[i] && value[i] !== " " ? "filled" : ""}`}
          value={value[i] && value[i] !== " " ? value[i] : ""}
          onChange={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
