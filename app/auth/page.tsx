"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthTabSwitcherProps {
  activeTab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
}

function AuthTabSwitcher({ activeTab, onTabChange }: AuthTabSwitcherProps) {
  return (
    <div className="relative flex w-full p-1 bg-[#EBE4D8]/90 backdrop-blur-xs rounded-2xl border border-[#3E2C23]/15 shadow-inner mb-4">
      {/* Sliding Pill Indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#4E3524] rounded-xl shadow-md transition-all duration-300 ease-out ${activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
      />
      <button
        type="button"
        onClick={() => onTabChange("login")}
        className={`relative z-10 w-1/2 py-2.5 text-base md:text-lg font-serif font-medium text-center transition-colors duration-200 cursor-pointer ${activeTab === "login"
            ? "text-[#F8F5F2]"
            : "text-[#5A3E2B]/80 hover:text-[#3E2C23]"
          }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        className={`relative z-10 w-1/2 py-2.5 text-base md:text-lg font-serif font-medium text-center transition-colors duration-200 cursor-pointer ${activeTab === "signup"
            ? "text-[#F8F5F2]"
            : "text-[#5A3E2B]/80 hover:text-[#3E2C23]"
          }`}
      >
        Sign Up
      </button>
    </div>
  );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
}

function AuthInput({ compact, className = "", ...props }: AuthInputProps) {
  return (
    <input
      {...props}
      className={`w-full ${compact ? "h-10 px-4 text-sm md:text-base" : "h-11 px-5 text-base"
        } rounded-xl bg-[#FAF7F2]/95 border border-[#3E2C23]/25 text-[#2C1D11] placeholder:text-[#6E5440]/60 placeholder:italic font-sans focus:outline-none focus:ring-2 focus:ring-[#4E3524]/30 focus:border-[#4E3524] transition-all shadow-xs ${className}`}
    />
  );
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === "signup") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupEmail)) {
          alert("Please enter a valid email address.");
          return;
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: signupUsername,
            email: signupEmail,
            password: signupPassword,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Account created successfully!");

          setSignupUsername("");
          setSignupEmail("");
          setSignupPassword("");

          window.location.href = "/dashboard";
        } else {
          alert(data.message);
        }
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Login successful!");

          setLoginEmail("");
          setLoginPassword("");

          window.location.href = "/dashboard";
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#F8F5F2] bg-[url('/login_pg_mb.png')] md:bg-[url('/login_bg_desk.png')] bg-cover md:bg-[length:100%_100%] bg-center bg-no-repeat px-4 py-8 select-none overflow-y-auto">
      {/* Main Fixed Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto my-auto">

        {/* 1. Fixed Logo Container */}
        <Link
          href="/"
          className="relative w-full max-w-[420px] md:max-w-[480px] h-auto mb-4 md:mb-5 flex items-center justify-center cursor-pointer block"
        >
          <Image
            src="/branding/logo_removed.png"
            alt="Bookishly Yours Logo"
            width={1408}
            height={636}
            priority
            className="w-full h-auto object-contain select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(44,29,17,0.16)]"
          />
        </Link>

        {/* 2. Fixed Auth Card Container */}
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

          {/* Fixed Tab Switcher Header */}
          <AuthTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Single Fixed Form Container */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">

            {/* Fixed-Height Input Slot (152px) to keep exact button and layout position */}
            <div className="w-full h-[152px] flex flex-col justify-center mb-3">
              {activeTab === "login" ? (
                /* LOGIN FIELDS (2 inputs) */
                <div className="flex flex-col space-y-3 w-full animate-fade-in">
                  <AuthInput
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Username or email address"
                  />
                  <AuthInput
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              ) : (
                /* SIGN UP FIELDS (3 inputs with compact uniform sizing) */
                <div className="flex flex-col space-y-2 w-full animate-fade-in">
                  <AuthInput
                    compact
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="Create username"
                  />
                  <AuthInput
                    compact
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Email"
                  />
                  <AuthInput
                    compact
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              )}
            </div>

            {/* 3. Fixed Submit Button - Stays in exact same vertical position at all times */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#3E2C23] text-[#F8F5F2] rounded-xl text-base md:text-lg font-medium shadow-md hover:bg-[#2C1D11] hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
            >
              {activeTab === "login" ? "Login" : "Create Account"}
            </button>

            {/* 4. Fixed Action Links Container */}
            <div className="flex flex-col items-center justify-center space-y-1.5 pt-3 text-sm text-[#4E3524] h-[52px]">
              {activeTab === "login" ? (
                <>
                  <button
                    type="button"
                    className="text-[#5A3E2B]/80 hover:text-[#2C1D11] hover:underline font-sans transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-[#5A3E2B]/80 hover:text-[#2C1D11] hover:underline font-sans transition-colors cursor-pointer"
                  >
                    Don&apos;t have an account? <span className="font-semibold text-[#3E2C23]">Sign Up</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-[#5A3E2B]/80 hover:text-[#2C1D11] hover:underline font-sans transition-colors cursor-pointer"
                >
                  Already have an account? <span className="font-semibold text-[#3E2C23]">Switch to login form</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
