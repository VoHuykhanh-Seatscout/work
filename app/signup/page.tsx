"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Sword } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Using OROA brand colors from the navbar
const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // Default to student
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "emailVerified" && event.newValue === "true") {
        console.log("✅ Email verified detected via storage event.");
        setVerified(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const strength = getPasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  useEffect(() => {
    setPasswordsMatch(formData.password === formData.confirmPassword);
  }, [formData.password, formData.confirmPassword]);

  const getPasswordStrength = (password: string) => {
    if (!password) return "";
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const mediumRegex = /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,})$/;

    if (strongRegex.test(password)) return "Strong";
    if (mediumRegex.test(password)) return "Medium";
    return "Weak";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword || !role) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwordStrength === "Weak") {
      setError("Password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.status === 409) throw new Error("Email already in use. Please log in.");
      if (!res.ok) throw new Error(data.error || "Signup failed. Please try again.");

      setSuccess("✅ Signup successful! Check your email for verification.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  setError("");
  setLoading(true);
  try {
    await signIn("google", { callbackUrl: "/onboarding" });
  } catch (err) {
    setError("Google Sign-In failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const getStrengthColor = (strength: string) => {
    if (strength === "Strong") return "text-green-500";
    if (strength === "Medium") return "text-yellow-500";
    if (strength === "Weak") return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
      style={{ backgroundColor: brandColors.light }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:60px_60px] opacity-5"></div>
      </div>

      {/* Gradient background elements */}
      <div 
        className="absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full opacity-10 blur-xl"
        style={{ backgroundColor: brandColors.primary }}
      />
      <div 
        className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full opacity-10 blur-xl"
        style={{ backgroundColor: brandColors.secondary }}
      />

      {/* Form Container */}
      <motion.div
        className="w-full max-w-md p-8 rounded-2xl relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${brandColors.dark}10`,
          boxShadow: `0 12px 40px ${brandColors.dark}10`,
        }}
      >
        {/* OROA Branding - Matching Login Page */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
                boxShadow: `0 4px 12px ${brandColors.primary}30`
              }}
            >
              <Sword className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span 
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`
                }}
              >
                OROA
              </span>
            </h1>
          </div>
          <motion.p 
            className="text-center text-sm tracking-tight"
            style={{ color: brandColors.dark }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Where heroes complete quests and earn rewards
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg text-center text-sm"
            style={{
              backgroundColor: `${brandColors.secondary}10`,
              color: brandColors.secondary,
              border: `1px solid ${brandColors.secondary}20`
            }}
          >
            {error}
          </motion.div>
        )}

        {!verified && success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg text-center text-sm"
            style={{
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              border: `1px solid ${brandColors.primary}20`
            }}
          >
            {success}
          </motion.div>
        )}

        {verified && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg text-center text-sm"
            style={{
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              border: `1px solid ${brandColors.primary}20`
            }}
          >
            🎉 Your email is verified! Please log in.
          </motion.div>
        )}

        {!verified && (
          <>
            <motion.button
              onClick={handleGoogleSignIn}
              className="w-full p-3 rounded-xl text-sm font-bold tracking-tight flex items-center justify-center relative overflow-hidden"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: 'white',
                color: brandColors.dark,
                border: `1px solid ${brandColors.dark}15`,
                boxShadow: `0 2px 10px ${brandColors.dark}08`
              }}
            >
              <FaGoogle className="mr-3" style={{ color: brandColors.primary }} />
              <span>Continue with Google</span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t" style={{ borderColor: `${brandColors.dark}15` }} />
              <motion.span 
                className="mx-4 text-xs uppercase tracking-wider px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${brandColors.dark}08`,
                  color: brandColors.dark
                }}
                whileHover={{ scale: 1.1 }}
              >
                Or
              </motion.span>
              <div className="flex-grow border-t" style={{ borderColor: `${brandColors.dark}15` }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-xs font-medium mb-2 uppercase tracking-wider"
                  style={{ color: brandColors.dark }}
                >
                  Name
                </label>
                <motion.div whileHover={{ y: -1 }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${brandColors.dark}15`,
                      color: brandColors.dark,
                    }}
                    disabled={loading}
                  />
                </motion.div>
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-xs font-medium mb-2 uppercase tracking-wider"
                  style={{ color: brandColors.dark }}
                >
                  Email
                </label>
                <motion.div whileHover={{ y: -1 }}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${brandColors.dark}15`,
                      color: brandColors.dark,
                    }}
                    disabled={loading}
                  />
                </motion.div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-xs font-medium mb-2 uppercase tracking-wider"
                  style={{ color: brandColors.dark }}
                >
                  Password
                </label>
                <motion.div whileHover={{ y: -1 }} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${brandColors.dark}15`,
                      color: brandColors.dark,
                    }}
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                    whileHover={{ scale: 1.1 }}
                    style={{ color: brandColors.dark }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                </motion.div>
                {formData.password && (
                  <p className={`text-xs font-medium ${getStrengthColor(passwordStrength)} mt-1`}>
                    Password Strength: {passwordStrength}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-xs font-medium mb-2 uppercase tracking-wider"
                  style={{ color: brandColors.dark }}
                >
                  Confirm Password
                </label>
                <motion.div whileHover={{ y: -1 }} className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${brandColors.dark}15`,
                      color: brandColors.dark,
                    }}
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                    whileHover={{ scale: 1.1 }}
                    style={{ color: brandColors.dark }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                </motion.div>
                {formData.confirmPassword && (
                  <div className="flex items-center mt-1">
                    {passwordsMatch ? (
                      <FaCheckCircle className="text-green-500 mr-1" />
                    ) : (
                      <FaTimesCircle className="text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label 
                  htmlFor="role" 
                  className="block text-xs font-medium mb-2 uppercase tracking-wider"
                  style={{ color: brandColors.dark }}
                >
                  I Am A
                </label>
                <motion.div whileHover={{ y: -1 }} className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl text-sm tracking-tight appearance-none focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'white',
                      border: `1px solid ${brandColors.dark}15`,
                      color: brandColors.dark,
                    }}
                    disabled={loading}
                  >
                    <option value="student">Hero (Student)</option>
                    <option value="business">Quest Giver (Business)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mr-2 rounded"
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${brandColors.dark}15`,
                    color: brandColors.primary
                  }}
                />
                <span className="text-xs" style={{ color: brandColors.dark }}>
                  I agree to the{" "}
                  <button
                    onClick={() => router.push("/terms")}
                    className="font-bold"
                    style={{ color: brandColors.primary }}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    onClick={() => router.push("/privacy")}
                    className="font-bold"
                    style={{ color: brandColors.primary }}
                  >
                    Privacy Policy
                  </button>
                </span>
              </div>

              <motion.button
                type="submit"
                className="w-full p-3 rounded-xl text-sm font-bold tracking-tight relative overflow-hidden"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`,
                  color: 'white',
                  boxShadow: `0 4px 14px ${brandColors.primary}40`
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <span>Join as {formData.role === 'student' ? 'Hero' : 'Quest Giver'}</span>
                )}
              </motion.button>
            </form>

            <motion.p 
              className="mt-6 text-center text-xs tracking-tight"
              style={{ color: brandColors.dark }}
            >
              Already have an account?{' '}
              <motion.button
                onClick={() => router.push("/login")}
                className="font-bold"
                whileHover={{ x: 2 }}
                style={{ color: brandColors.primary }}
              >
                Sign in
              </motion.button>
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
}