"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiLoader, FiAward, FiArrowRight } from "react-icons/fi";
import { Sword } from "lucide-react";
import { Suspense } from "react";

// OROA brand colors
const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

function VerifyContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Preparing your creative space...");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVerifying) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isVerifying]);

  useEffect(() => {
    if (status === "authenticated" && !redirecting) {
      setProgress(100);
      setTimeout(() => {
        const role = session?.user?.role?.toLowerCase();
        router.replace(role === "business" ? "/business-dashboard/onboarding" : "/onboarding");
      }, 800);
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      setMessage("Invalid verification link");
      setError("Missing verification token. Please check your email again.");
      return;
    }

    async function verifyEmail() {
      setIsVerifying(true);
      setProgress(20);
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Verification failed");

        if (data.isVerified) {
          setMessage("Welcome to OROA!");
          setHasVerified(true);
          setProgress(70);

          const signInResponse = await signIn("credentials", {
            email: data.email,
            password: "",
            redirect: false,
          });

          if (signInResponse?.error) {
            throw new Error("Automatic login failed");
          }

          const checkSession = setInterval(() => {
            const updatedSession = session;
            if (updatedSession) {
              clearInterval(checkSession);
              setProgress(100);
              setRedirecting(true);
              setTimeout(() => {
                router.replace(
                  updatedSession.user.role === "business" ? "/studio" : "/canvas"
                );
              }, 800);
            }
          }, 500);

        } else {
          setMessage("Verification incomplete");
          setError("Please try the verification link again.");
        }
      } catch (err) {
        setMessage("Verification failed");
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsVerifying(false);
      }
    }

    if (!hasVerified && !isVerifying && status !== "authenticated") {
      verifyEmail();
    }
  }, [searchParams, status, session, router, hasVerified, isVerifying, redirecting]);

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

      <motion.div
        className="w-full max-w-md p-8 rounded-2xl relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${brandColors.dark}10`,
          boxShadow: `0 12px 40px ${brandColors.dark}10`,
        }}
      >
        {/* OROA Branding */}
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

        <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-6"
            >
              <h2 className="text-2xl font-bold tracking-tight"
                style={{ color: brandColors.dark }}
              >
                Building Your Hero's Journey
              </h2>
              <p className="text-sm" style={{ color: brandColors.dark }}>
                Preparing your quest log and inventory...
              </p>
              
              <div className="w-full h-2 rounded-full bg-gray-200 mt-4">
                <motion.div 
                  className="h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})`
                  }}
                />
              </div>
              
              <div className="flex items-center mt-2 text-xs"
                style={{ color: brandColors.dark }}
              >
                <FiLoader className="animate-spin mr-2" />
                <span>{progress}% complete</span>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColors.secondary}10` }}
              >
                <FiAlertCircle className="w-10 h-10" 
                  style={{ color: brandColors.secondary }} 
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight"
                style={{ color: brandColors.dark }}
              >
                Verification Issue
              </h2>
              <p className="text-sm px-4" style={{ color: brandColors.dark }}>
                {message}
              </p>
              <p className="text-sm px-4 mt-2" 
                style={{ color: brandColors.secondary }}
              >
                {error}
              </p>
              <motion.button 
                className="mt-4 px-6 py-2 rounded-xl text-sm font-bold tracking-tight flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: brandColors.secondary,
                  color: 'white',
                  boxShadow: `0 4px 14px ${brandColors.secondary}40`
                }}
                onClick={() => window.location.reload()}
              >
                Try Again <FiArrowRight className="ml-2" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColors.primary}10` }}
              >
                <FiCheckCircle className="w-10 h-10" 
                  style={{ color: brandColors.primary }} 
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight"
                style={{ color: brandColors.dark }}
              >
                {hasVerified ? "Quest Ready!" : "Almost There!"}
              </h2>
              <p className="text-sm px-4" style={{ color: brandColors.dark }}>
                {message}
              </p>
              
              {hasVerified && (
                <motion.div
                  className="mt-4 flex items-center text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ color: brandColors.dark }}
                >
                  <FiLoader className="animate-spin mr-2" />
                  <span>Preparing your dashboard...</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-8 pt-6 border-t text-center text-xs tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            borderColor: `${brandColors.dark}10`,
            color: brandColors.dark
          }}
        >
          <p>For heroes and quest givers alike</p>
          <p className="mt-1">© {new Date().getFullYear()} OROA - All rights reserved</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}