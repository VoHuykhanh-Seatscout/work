"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaGlobe, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChevronRight, FaChevronLeft, FaRocket } from 'react-icons/fa';
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

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Hospitality",
  "Construction",
  "Marketing",
  "Consulting",
  "Other"
];

const OnboardingForm = () => {  // Remove the props
  const { data: session, update } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;  // Get userId from session
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: session?.user?.email || '',
    phone: '',
    website: '',
    linkedin: '',
    location: '',
    industry: '',
    bio: '',
    logo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('Please refresh and try again');
      return;
    }

    setIsLoading(true);

    try {
      // Save the business profile
      const response = await fetch('/api/business-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      // Mark onboarding as complete
      const completeResponse = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to mark onboarding as complete');
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          onboardingComplete: true,
          businessName: formData.name
        }
      });

      toast.success('Business profile saved successfully!');
      router.push('/business-dashboard');
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
        credentials: 'include'
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to mark onboarding as complete');
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          onboardingComplete: true
        }
      });

      router.push('/business-dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to skip onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#F9F5F0] to-[#FFE0D2]">
      {/* Background elements (same as before) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF5722]/5 via-transparent to-[#D84315]/5"></div>
        
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
        {/* Header */}
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
              Set up your business profile to start posting quests
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
              <h1 className="text-lg font-bold">Business Profile Setup</h1>
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
                    <FaBuilding className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#212121]">Business Information</h2>
                    <p className="text-xs text-[#212121]/70">Tell us about your company</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Company Name
                      <span className="text-[#D84315]"> *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                        placeholder="Your company name"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Industry
                      <span className="text-[#D84315]"> *</span>
                    </label>
                    <div className="relative">
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm appearance-none"
                        required
                      >
                        <option value="">Select your industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#212121]/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Email
                      <span className="text-[#D84315]"> *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                        placeholder="business@example.com"
                        required
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                        <FaEnvelope className="text-sm" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Phone
                      <span className="text-[#D84315]"> *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                        <FaPhone className="text-sm" />
                      </div>
                    </div>
                  </motion.div>
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
                    disabled={!formData.name || !formData.industry || !formData.email || !formData.phone}
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
                    <FaGlobe className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#212121]">Company Details</h2>
                    <p className="text-xs text-[#212121]/70">Add more information about your business</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                        placeholder="https://yourcompany.com"
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                        <FaGlobe className="text-sm" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      LinkedIn (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                        <FaLinkedin className="text-sm" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm pl-10"
                        placeholder="City, Country"
                      />
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-[#212121]/40">
                        <FaMapMarkerAlt className="text-sm" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Company Bio (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all min-h-[100px] bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                        placeholder="Tell us about your company, mission, and values..."
                        maxLength={500}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[#212121]/50">{formData.bio.length}/500 characters</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium mb-1 text-[#212121]">
                      Logo URL (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg text-sm tracking-tight focus:outline-none focus:ring-2 transition-all bg-white border border-[#212121]/15 text-[#212121] focus:ring-[#D84315]/30 focus:border-[#D84315]/50 shadow-sm"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    {formData.logo && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={formData.logo} 
                          alt="Company logo preview" 
                          className="h-16 w-16 object-contain rounded-lg border border-[#212121]/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
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
                        Complete Setup <FiCheckCircle className="text-xs" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
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
              "Great businesses are built on great relationships and opportunities"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingForm;