"use client";


import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaCode, FaFileAlt, FaUserEdit, FaChevronRight, FaChevronLeft, FaRocket } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import { Sword } from 'lucide-react';


const brandColors = {
 primary: "#D84315",
 secondary: "#FF5722",
 accent: "#FF7043",
 dark: "#212121",
 light: "#FFF3E0",
 creative: "#8A2BE2",
 success: "#30D158",
 background: "#F9F5F0",
};


interface OnboardingFormProps {
 userId: string;
}


const OnboardingForm = ({ userId }: OnboardingFormProps) => {
 const { data: session, update } = useSession();
 const router = useRouter();
 const [step, setStep] = useState(1);
 const [formData, setFormData] = useState({
   university: '',
   degree: '',
   graduationYear: '',
   skills: [] as string[],
   resume: '',
   aboutMe: '',
 });
 const [isLoading, setIsLoading] = useState(false);


 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({ ...prev, [name]: value }));
 };


 const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { value, checked } = e.target;
   setFormData(prev => ({
     ...prev,
     skills: checked
       ? [...prev.skills, value]
       : prev.skills.filter(skill => skill !== value),
   }));
 };


 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
  if (!userId) {
   toast.error('Please refresh and try again');
   return;
 }


 setIsLoading(true);


 try {
   // First, save the student profile
   const response = await fetch('/api/student-profile', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       ...formData,
       userId,
       graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null
     }),
   });


   if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.error || 'Failed to save profile');
   }


   // Then mark onboarding as complete
   const completeResponse = await fetch('/api/user/complete-onboarding', {
 method: 'POST',
 headers: {
   'Content-Type': 'application/json'
 },
 credentials: 'include' // This is enough for session cookies
});


   if (!completeResponse.ok) {
     throw new Error('Failed to mark onboarding as complete');
   }


   // Update session with skills if any
   if (formData.skills.length > 0) {
     await update({
       ...session,
       user: {
         ...session?.user,
         skills: formData.skills,
         onboardingComplete: true
       }
     });
   } else {
     await update({
       ...session,
       user: {
         ...session?.user,
         onboardingComplete: true
       }
     });
   }


   toast.success('Profile saved successfully!');
   router.push('/');
 } catch (error) {
   toast.error(error instanceof Error ? error.message : 'Something went wrong');
 } finally {
   setIsLoading(false);
 }
};


const handleSkip = async () => {
 try {
   setIsLoading(true);
   const completeResponse = await fetch('/api/user/complete-onboarding', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     credentials: 'include' // Important for session cookies
   });


   if (!completeResponse.ok) {
     throw new Error('Failed to mark onboarding as complete');
   }


   // Update session
   await update({
     ...session,
     user: {
       ...session?.user,
       onboardingComplete: true
     }
   });


   router.push('/');
 } catch (error) {
   toast.error(error instanceof Error ? error.message : 'Failed to skip onboarding');
 } finally {
   setIsLoading(false);
 }
};


 const skillsList = [
   { name: 'JavaScript', icon: '🟨', category: 'Development' },
   { name: 'Python', icon: '🟦', category: 'Development' },
   { name: 'React', icon: '⚛️', category: 'Development' },
   { name: 'Node.js', icon: '🟢', category: 'Development' },
   { name: 'UI/UX', icon: '🎨', category: 'Design' },
   { name: 'Data Science', icon: '📊', category: 'Data' },
   { name: 'Graphic Design', icon: '✏️', category: 'Design' },
   { name: '3D Modeling', icon: '🟧', category: 'Design' },
   { name: 'Machine Learning', icon: '🧠', category: 'Data' },
   { name: 'Cloud Computing', icon: '☁️', category: 'Development' },
   { name: 'DevOps', icon: '🔄', category: 'Development' },
   { name: 'Mobile Development', icon: '📱', category: 'Development' },
 ];


 // Group skills by category
 const skillsByCategory = skillsList.reduce((acc, skill) => {
   if (!acc[skill.category]) {
     acc[skill.category] = [];
   }
   acc[skill.category].push(skill);
   return acc;
 }, {} as Record<string, typeof skillsList>);


 return (
   <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#F9F5F0] to-[#FFE0D2]">
     {/* Heroic background elements */}
     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
       {/* Animated gradient background */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF5722]/5 via-transparent to-[#D84315]/5"></div>
      
       {/* Floating particles */}
       {[...Array(20)].map((_, i) => (
         <motion.div
           key={i}
           className="absolute rounded-full bg-[#FF5722]/20"
           style={{
             width: Math.random() * 10 + 5 + 'px',
             height: Math.random() * 10 + 5 + 'px',
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
           }}
           animate={{
             y: [0, (Math.random() * 100) - 50],
             x: [0, (Math.random() * 60) - 30],
             opacity: [0.2, 0.8, 0.2],
           }}
           transition={{
             duration: Math.random() * 10 + 10,
             repeat: Infinity,
             repeatType: "reverse",
             ease: "easeInOut",
           }}
         />
       ))}


       {/* Decorative shapes */}
       <motion.div
         className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-[#FF7043]/10 blur-xl"
         animate={{
           scale: [1, 1.2, 1],
           opacity: [0.3, 0.6, 0.3],
         }}
         transition={{
           duration: 8,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
       <motion.div
         className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-[#D84315]/10 blur-xl"
         animate={{
           scale: [1, 1.1, 1],
           opacity: [0.2, 0.5, 0.2],
         }}
         transition={{
           duration: 12,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
     </div>


     <motion.div
       initial={{ opacity: 0, y: 20, scale: 0.98 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       transition={{ duration: 0.5, ease: "easeOut" }}
       className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-[#212121]/10"
     >
       {/* Header with improved visual hierarchy */}
       <div className="p-6 text-white relative overflow-hidden bg-gradient-to-br from-[#D84315] to-[#FF5722]">
         <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
         <div className="flex flex-col items-center mb-4 relative z-10">
           <motion.div
             className="flex items-center gap-3 mb-3"
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
           >
             <motion.div
               className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-sm"
               whileHover={{ rotate: 10, scale: 1.05 }}
             >
               <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
             </motion.div>
             <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#FFE66D]">
               OROA
             </h1>
           </motion.div>
           <motion.p
             className="text-center text-xs tracking-tight text-white/90 max-w-xs"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
           >
             Craft your hero profile to unlock personalized opportunities
           </motion.p>
         </div>


         <div className="flex justify-between items-center mb-3 relative z-10">
           <motion.div
             className="flex items-center gap-2"
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
             <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
               <FaRocket className="text-sm text-[#FFE66D]" />
             </div>
             <h1 className="text-lg font-bold">Hero Profile Setup</h1>
           </motion.div>
           <motion.div
             className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm font-medium"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
           >
             Step {step} of 2
           </motion.div>
         </div>
        
         {/* Animated progress bar */}
         <motion.div
           className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden mb-1"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
         >
           <motion.div
             className="h-full rounded-full bg-gradient-to-r from-white to-[#FFE66D]"
             initial={{ width: '0%' }}
             animate={{ width: step === 1 ? '50%' : '100%' }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           />
         </motion.div>
       </div>


       {/* Form Content */}
       <div className="p-6">
         <AnimatePresence mode="wait">
           {step === 1 && (
             <motion.div
               key="step1"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               transition={{ duration: 0.3, ease: "easeInOut" }}
               className="space-y-4"
             >
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-[#FFF3E0] text-[#D84315]">
                   <FaGraduationCap className="text-lg" />
                 </div>
                 <div>
                   <h2 className="text-lg font-semibold text-[#212121]">Education</h2>
                   <p className="text-xs text-[#212121]/70">Tell us about your academic journey</p>
                 </div>
               </div>


               <div className="space-y-4">
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                 >
                   <label className="block text-sm font-medium mb-1 text-[#212121]">
                     University
                     <span className="text-[#D84315]"> *</span>
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       name="university"
                       value={formData.university}
                       onChange={handleChange}
                       className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                       placeholder="Where did/will you graduate?"
                       required
                     />
                   </div>
                 </motion.div>


                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.15 }}
                   >
                     <label className="block text-sm font-medium mb-1 text-[#212121]">
                       Degree
                       <span className="text-[#D84315]"> *</span>
                     </label>
                     <div className="relative">
                       <input
                         type="text"
                         name="degree"
                         value={formData.degree}
                         onChange={handleChange}
                         className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                         placeholder="e.g., Computer Science"
                         required
                       />
                     </div>
                   </motion.div>


                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                   >
                     <label className="block text-sm font-medium mb-1 text-[#212121]">
                       Graduation Year
                     </label>
                     <div className="relative">
                       <input
                         type="number"
                         name="graduationYear"
                         value={formData.graduationYear}
                         onChange={handleChange}
                         className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                         placeholder="e.g., 2025"
                         min={2000}
                         max={2100}
                       />
                     </div>
                   </motion.div>
                 </div>
               </div>


               <div className="flex justify-between pt-4">
                 <motion.button
                   onClick={handleSkip}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-4 py-2 rounded-lg text-xs font-medium tracking-tight text-[#212121] border border-[#212121]/15 hover:bg-[#212121]/5 transition-all flex items-center gap-1"
                 >
                   Skip for Now
                 </motion.button>
                 <motion.button
                   onClick={() => setStep(2)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-4 py-2 text-xs font-bold tracking-tight rounded-lg flex items-center gap-1 bg-gradient-to-r from-[#D84315] to-[#FF5722] text-white hover:shadow-[0_4px_15px_rgba(216,67,21,0.3)] transition-all"
                   disabled={!formData.university || !formData.degree}
                 >
                   Continue <FaChevronRight className="text-xs" />
                 </motion.button>
               </div>
             </motion.div>
           )}


           {step === 2 && (
             <motion.div
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3, ease: "easeInOut" }}
               className="space-y-4"
             >
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-[#FFF3E0] text-[#FF5722]">
                   <FaCode className="text-lg" />
                 </div>
                 <div>
                   <h2 className="text-lg font-semibold text-[#212121]">Your Skills</h2>
                   <p className="text-xs text-[#212121]/70">Showcase your powers and expertise</p>
                 </div>
               </div>


               <div className="space-y-4">
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                 >
                   <label className="block text-sm font-medium mb-2 text-[#212121]">
                     Select Your Skills
                   </label>
                   <div className="space-y-3">
                     {Object.entries(skillsByCategory).map(([category, skills]) => (
                       <div key={category} className="space-y-1">
                         <h3 className="text-xs font-semibold uppercase tracking-wider text-[#212121]/60">{category}</h3>
                         <div className="grid grid-cols-2 gap-2">
                           {skills.map((skill) => (
                             <motion.label
                               key={skill.name}
                               whileHover={{ y: -2 }}
                               className={`flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                                 formData.skills.includes(skill.name)
                                   ? 'border-2 font-medium border-[#FF5722] bg-[#FF5722]/10'
                                   : 'border border-[#212121]/10 bg-white hover:bg-[#FFF3E0]'
                               }`}
                             >
                               <input
                                 type="checkbox"
                                 value={skill.name}
                                 checked={formData.skills.includes(skill.name)}
                                 onChange={handleSkillsChange}
                                 className="hidden"
                               />
                               <span className="text-sm">{skill.icon}</span>
                               <span className="flex-1">{skill.name}</span>
                               {formData.skills.includes(skill.name) && (
                                 <FiCheckCircle className="ml-auto text-[#FF5722]" />
                               )}
                             </motion.label>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 </motion.div>


                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.15 }}
                 >
                   <label className="block text-sm font-medium mb-1 text-[#212121]">
                     Resume Link (Optional)
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       name="resume"
                       value={formData.resume}
                       onChange={handleChange}
                       className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                       placeholder="Link to your resume or portfolio"
                     />
                     <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                       <FaFileAlt className="text-sm" />
                     </div>
                   </div>
                   <p className="mt-1 text-xs text-[#212121]/50">e.g., LinkedIn, personal website, or PDF link</p>
                 </motion.div>


                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                 >
                   <label className="block text-sm font-medium mb-1 text-[#212121]">
                     About You (Optional)
                   </label>
                   <div className="relative">
                     <textarea
                       name="aboutMe"
                       value={formData.aboutMe}
                       onChange={handleChange}
                       className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all min-h-[80px] bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                       placeholder="Tell us about your heroic journey..."
                     />
                     <div className="absolute top-3 left-2 flex items-start pointer-events-none text-[#212121]/40">
                       <FaUserEdit className="text-sm" />
                     </div>
                   </div>
                   <p className="mt-1 text-xs text-[#212121]/50">Max 250 characters</p>
                 </motion.div>
               </div>


               <div className="flex justify-between pt-4">
                 <motion.button
                   onClick={() => setStep(1)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-4 py-2 rounded-lg text-xs font-medium tracking-tight flex items-center gap-1 text-[#212121] border border-[#212121]/15 hover:bg-[#212121]/5 transition-colors"
                 >
                   <FaChevronLeft className="text-xs" /> Back
                 </motion.button>
                 <motion.button
                   onClick={handleSubmit}
                   disabled={isLoading}
                   whileHover={{ scale: isLoading ? 1 : 1.02 }}
                   whileTap={{ scale: isLoading ? 1 : 0.98 }}
                   className={`px-4 py-2 text-xs font-bold tracking-tight rounded-lg flex items-center gap-1 ${
                     isLoading ? 'opacity-90 cursor-not-allowed' : ''
                   } bg-gradient-to-r from-[#D84315] to-[#FF5722] text-white hover:shadow-[0_4px_15px_rgba(216,67,21,0.3)] transition-all`}
                 >
                   {isLoading ? (
                     <>
                       <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Saving...
                     </>
                   ) : (
                     <>
                       Complete Profile <FiCheckCircle className="text-xs" />
                     </>
                   )}
                 </motion.button>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
       </div>


       {/* Footer with improved design */}
       <div className="p-3 border-t border-[#212121]/5 bg-[#FFF3E0]/30">
         <div className="flex flex-col items-center">
           <div className="flex justify-center gap-1.5 mb-1.5">
             {[...Array(3)].map((_, i) => (
               <motion.div
                 key={i}
                 className={`w-2 h-2 rounded-full ${
                   i === 0 ? 'bg-[#D84315]' :
                   i === 1 ? 'bg-[#FF5722]' : 'bg-[#FF7043]'
                 }`}
                 animate={{
                   y: [0, -3, 0],
                   scale: [1, 1.1, 1]
                 }}
                 transition={{
                   duration: 1.8,
                   repeat: Infinity,
                   repeatType: "loop",
                   delay: i * 0.3
                 }}
               />
             ))}
           </div>
           <p className="text-center text-xs text-[#212121]/60 font-medium">
             "Heroes are made by the paths they choose, not the powers they are graced with."
           </p>
         </div>
       </div>
     </motion.div>
   </div>
 );
};


export default OnboardingForm;