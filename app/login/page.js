"use client";


import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Sword } from "lucide-react";


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


export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [role, setRole] = useState("student");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const router = useRouter();


 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   setError("");
    try {
     const result = await signIn("credentials", {
       email,
       password,
       role: role.toUpperCase(),
       redirect: false,
       callbackUrl: role === "business" ? "/business-dashboard" : "/"
     });
      if (result?.error) {
       setError(result.error);
     } else {
       router.push(result?.url || "/");
     }
   } catch (err) {
     setError("An unexpected error occurred. Please try again.");
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


       {/* Form */}
       <form onSubmit={handleSubmit} className="space-y-5">
         {/* Email Field */}
         <div>
           <label
             htmlFor="email"
             className="block text-xs font-medium mb-2 uppercase tracking-wider"
             style={{ color: brandColors.dark }}
           >
             Email Address
           </label>
           <motion.div whileHover={{ y: -1 }}>
             <input
               id="email"
               type="email"
               placeholder="your@email.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               autoFocus
               className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
               style={{
                 backgroundColor: 'white',
                 border: `1px solid ${brandColors.dark}15`,
                 color: brandColors.dark,
                 focusRing: brandColors.primary
               }}
             />
           </motion.div>
         </div>


         {/* Password Field */}
         <div>
           <label
             htmlFor="password"
             className="block text-xs font-medium mb-2 uppercase tracking-wider"
             style={{ color: brandColors.dark }}
           >
             Password
           </label>
           <motion.div whileHover={{ y: -1 }}>
             <input
               id="password"
               type="password"
               placeholder="••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               className="w-full p-3 rounded-xl text-sm tracking-tight focus:outline-none focus:ring-2 transition-all"
               style={{
                 backgroundColor: 'white',
                 border: `1px solid ${brandColors.dark}15`,
                 color: brandColors.dark,
                 focusRing: brandColors.primary
               }}
             />
           </motion.div>
           <motion.button
             onClick={() => router.push("/auth/reset-password")}
             className="text-xs mt-2 tracking-tight"
             whileHover={{ x: 2 }}
             style={{ color: brandColors.primary }}
           >
             Forgot Password?
           </motion.button>
         </div>


         {/* Role Selector */}
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
               id="role"
               value={role}
               onChange={(e) => setRole(e.target.value)}
               className="w-full p-3 rounded-xl text-sm tracking-tight appearance-none focus:outline-none focus:ring-2 transition-all"
               style={{
                 backgroundColor: 'white',
                 border: `1px solid ${brandColors.dark}15`,
                 color: brandColors.dark,
                 focusRing: brandColors.primary
               }}
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


         {/* Login Button */}
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
             <span>Continue as {role === 'business' ? 'Quest Giver' : 'Hero'}</span>
           )}
         </motion.button>
       </form>


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


       {/* Google Button */}
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


       {/* CTA Link */}
       <motion.p
         className="mt-8 text-center text-xs tracking-tight"
         style={{ color: brandColors.dark }}
       >
         New to OROA?{' '}
         <motion.button
           onClick={() => router.push("/signup")}
           className="font-bold"
           whileHover={{ x: 2 }}
           style={{ color: brandColors.primary }}
         >
           Join the adventure
         </motion.button>
       </motion.p>


       {/* Social Proof */}
       <motion.div
         className="mt-8 text-center text-xs tracking-tight"
         style={{ color: brandColors.dark }}
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5 }}
       >
         <p>Join <span className="font-bold">10,000+ heroes</span> completing quests</p>
       </motion.div>
     </motion.div>
   </div>
 );
}
