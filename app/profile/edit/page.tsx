"use client";

import React, { useState, useEffect } from "react";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select from "react-select";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Code,
  Laptop,
  BarChart2,
  PenTool,
  Megaphone,
  Activity,
  Package,
  GraduationCap,
  User,
  Upload,
  Check,
  Sparkles,
  Palette,
  Camera,
  PenLine,
  Globe,
  BookOpen,
  Linkedin,
  Github,
  FileText,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

// Define brand colors to match the theme
const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",    // Purple
  success: "#30D158",     // Green
};

interface StudentProfile {
  name: string;
  profilePicture?: string;
  tagline: string;
  shortIntroduction: string;
  university: string;
  degree: string;
  graduationYear: number;
  linkedin: string;
  github: string;
  skills: string[];
  aboutMe: string;
  resume: string;
}

const skillCategories = [
  {
    label: "Soft Skills",
    options: [
      { value: "Leadership", label: "Leadership" },
      { value: "Teamwork", label: "Teamwork" },
      { value: "Communication", label: "Communication" },
      { value: "Time Management", label: "Time Management" },
      { value: "Problem Solving", label: "Problem Solving" },
      { value: "Planning", label: "Planning" },
    ],
  },
  {
    label: "Technical Skills",
    options: [
      { value: "Python", label: "Python" },
      { value: "JavaScript", label: "JavaScript" },
      { value: "SQL", label: "SQL" },
      { value: "Excel", label: "Excel" },
      { value: "Data Analysis", label: "Data Analysis" },
      { value: "Web Development", label: "Web Development" },
      { value: "HTML/CSS", label: "HTML/CSS" },
    ],
  },
  {
    label: "Design Skills",
    options: [
      { value: "UI/UX Design", label: "UI/UX Design" },
      { value: "Figma", label: "Figma" },
      { value: "Adobe Photoshop", label: "Adobe Photoshop" },
      { value: "Canva", label: "Canva" },
    ],
  },
  {
    label: "Marketing Skills",
    options: [
      { value: "Social Media", label: "Social Media" },
      { value: "SEO", label: "SEO" },
      { value: "Content Creation", label: "Content Creation" },
      { value: "Copywriting", label: "Copywriting" },
      { value: "Branding", label: "Branding" },
    ],
  },
  {
    label: "Business Skills",
    options: [
      { value: "Project Management", label: "Project Management" },
      { value: "Strategy", label: "Strategy" },
      { value: "Market Research", label: "Market Research" },
      { value: "Finance", label: "Finance" },
    ],
  },
  {
    label: "Language Skills",
    options: [
      { value: "English", label: "English" },
      { value: "Spanish", label: "Spanish" },
      { value: "French", label: "French" },
      { value: "Japanese", label: "Japanese" },
    ],
  },
];

const taglineOptions = [
  {
    value: "Aspiring Entrepreneur",
    label: (
      <div className="flex items-center gap-2">
        <Briefcase size={16} /> Aspiring Entrepreneur
      </div>
    ),
  },
  {
    value: "Tech Expert",
    label: (
      <div className="flex items-center gap-2">
        <Code size={16} /> Tech Expert
      </div>
    ),
  },
  {
    value: "Software Developer",
    label: (
      <div className="flex items-center gap-2">
        <Laptop size={16} /> Software Developer
      </div>
    ),
  },
  {
    value: "Data Scientist",
    label: (
      <div className="flex items-center gap-2">
        <BarChart2 size={16} /> Data Scientist
      </div>
    ),
  },
  {
    value: "UI/UX Designer",
    label: (
      <div className="flex items-center gap-2">
        <PenTool size={16} /> UI/UX Designer
      </div>
    ),
  },
  {
    value: "Digital Marketer",
    label: (
      <div className="flex items-center gap-2">
        <Megaphone size={16} /> Digital Marketer
      </div>
    ),
  },
  {
    value: "Business Analyst",
    label: (
      <div className="flex items-center gap-2">
        <Activity size={16} /> Business Analyst
      </div>
    ),
  },
  {
    value: "Product Manager",
    label: (
      <div className="flex items-center gap-2">
        <Package size={16} /> Product Manager
      </div>
    ),
  },
  {
    value: "Student",
    label: (
      <div className="flex items-center gap-2">
        <GraduationCap size={16} /> Student
      </div>
    ),
  },
  {
    value: "Freelancer",
    label: (
      <div className="flex items-center gap-2">
        <User size={16} /> Freelancer
      </div>
    ),
  },
];

const EditProfilePage: React.FC = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: studentProfile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/profile");
      return data;
    },
  });

  const [formData, setFormData] = useState<StudentProfile>({
    name: "",
    profilePicture: "",
    tagline: "",
    shortIntroduction: "",
    university: "",
    degree: "",
    graduationYear: new Date().getFullYear(),
    linkedin: "",
    github: "",
    skills: [],
    aboutMe: "",
    resume: "",
  });

  interface ProfilePayload extends StudentProfile {
    image?: string;
  }

  const mutation = useMutation({
    mutationFn: async (updatedData: StudentProfile) => {
      const payload: ProfilePayload = { ...updatedData };
  
      if (updatedData.profilePicture && updatedData.profilePicture !== "/default-profile.png") {
        payload.image = updatedData.profilePicture;
      } else {
        delete payload.image;
      }
  
      const { data } = await axios.put("/api/profile", payload);
      return data;
    },
    onSuccess: async (data) => {
      await update();
      const updatedSession = await getSession();
      await signOut({ redirect: false });
      await signIn("credentials", {
        email: session?.user?.email,
        password: "",
        redirect: false,
      });
  
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      toast.success("Profile updated successfully!");
      router.refresh();
      router.push("/profile");
    },
    onError: () => {
      toast.error("Failed to save. Please try again.");
    },
  });

  useEffect(() => {
    if (studentProfile) {
      setFormData({
        name: studentProfile.name || "",
        profilePicture: studentProfile.profilePicture || "",
        tagline: studentProfile.tagline || "",
        shortIntroduction: studentProfile.shortIntroduction || "",
        university: studentProfile.university || "",
        degree: studentProfile.degree || "",
        graduationYear: studentProfile.graduationYear || new Date().getFullYear(),
        linkedin: studentProfile.linkedin || "",
        github: studentProfile.github || "",
        skills: studentProfile.skills || [],
        aboutMe: studentProfile.aboutMe || "",
        resume: studentProfile.resume || "",
      });
    }
  }, [studentProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduationYear" ? Number(value) : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }, 
      });
  
      if (!data.imageUrl) {
        throw new Error("No image URL returned");
      }
  
      setFormData((prev) => ({
        ...prev,
        profilePicture: data.imageUrl,
      }));
      toast.success("Profile picture uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload image");
    }
  };

  const handleSkillsChange = (selectedOptions: any) => {
    const skillsArray = selectedOptions.map((option: any) => option.value);
    setFormData((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!session) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(circle at 10% 20%, ${brandColors.primary}08, transparent 40%)`,
              `radial-gradient(ellipse at 90% 80%, ${brandColors.accent}06, transparent 50%)`,
              `conic-gradient(from 45deg at 50% 50%, ${brandColors.creative}04, transparent 70%)`
            ]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Lego-inspired dot grid overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px',
            color: brandColors.secondary
          }}
        />
      </div>

      <Navbar />

      <div className="max-w-5xl mx-auto pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center text-white px-6 py-2 rounded-full mb-4"
            style={{ 
              background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
              boxShadow: `0 4px 16px ${brandColors.primary}40`
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="mr-2" size={20} />
            <span className="font-medium">Creator Profile</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold tracking-tight mb-3"
            style={{ color: brandColors.dark }}
          >
            Craft Your Digital Identity
          </motion.h1>
          
          <motion.p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: brandColors.dark }}
          >
            Shape your professional story with our creative tools. Every detail helps the world see your unique value.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full mb-4"
                style={{ 
                  background: `linear-gradient(45deg, ${brandColors.light}, ${brandColors.accent}20)`
                }}
              ></div>
              <div 
                className="h-4 rounded w-48 mb-3"
                style={{ backgroundColor: brandColors.light }}
              ></div>
              <div 
                className="h-3 rounded w-64"
                style={{ backgroundColor: brandColors.light }}
              ></div>
            </div>
          </div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Profile Card */}
            <motion.div 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl relative"
              whileHover={{ y: -5 }}
            >
              <div 
                className="absolute inset-x-0 top-0 h-1"
                style={{ 
                  background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.accent})`
                }}
              ></div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Profile Picture */}
                  <motion.div 
                    className="flex-shrink-0 relative group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div 
                      className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg relative"
                      style={{ 
                        background: `linear-gradient(45deg, ${brandColors.light}, ${brandColors.accent}20)`
                      }}
                    >
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera size={48} className="opacity-70" />
                        </div>
                      )}
                    </div>
                    
                    <label className="absolute -bottom-3 -right-3 bg-white rounded-full p-3 shadow-md cursor-pointer hover:scale-105 transition-transform">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div 
                        className="flex items-center justify-center rounded-full p-2"
                        style={{ 
                          background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
                          color: 'white'
                        }}
                      >
                        <Upload size={16} />
                      </div>
                    </label>
                  </motion.div>

                  {/* Name and Tagline */}
                  <div className="flex-grow space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 items-center">
                        <PenLine className="mr-2" size={16} style={{ color: brandColors.primary }} />
                        <span style={{ color: brandColors.dark }}>Your Creative Identity</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all font-medium text-lg"
                        placeholder="e.g. Alex Johnson, Digital Creator"
                        required
                        style={{ 
                          borderColor: brandColors.light
                        }}
                      />
                    </div>

                    <div className="relative z-10">
                      <label className="block text-sm font-medium mb-2 items-center">
                        <Palette className="mr-2" size={16} style={{ color: brandColors.primary }} />
                        <span style={{ color: brandColors.dark }}>Professional Archetype</span>
                      </label>
                      <Select
                        name="tagline"
                        options={taglineOptions}
                        value={taglineOptions.find(option => option.value === formData.tagline)}
                        onChange={(selectedOption) => {
                          setFormData((prev) => ({
                            ...prev,
                            tagline: selectedOption ? selectedOption.value : "",
                          }));
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select your creative archetype..."
                        isSearchable
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '52px',
                            borderColor: '#e5e7eb',
                            borderRadius: '12px',
                            '&:hover': {
                              borderColor: '#d1d5db',
                            },
                          }),
                          menuPortal: base => ({ ...base, zIndex: 9999 }),
                          menu: base => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Education Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
              whileHover={{ y: -5 }}
            >
              <div className="p-8">
                <motion.h2 
                  className="text-2xl font-semibold mb-6 flex items-center"
                  style={{ color: brandColors.dark }}
                >
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ backgroundColor: `${brandColors.primary}10` }}
                  >
                    <GraduationCap size={24} style={{ color: brandColors.primary }} />
                  </div>
                  <span>Creative Education</span>
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: brandColors.dark }}>
                      University
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="e.g. Stanford University"
                      required
                      style={{ 
                        borderColor: brandColors.light
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: brandColors.dark }}>
                      Degree & Focus
                    </label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="e.g. Computer Science"
                      required
                      style={{ 
                        borderColor: brandColors.light
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium mb-1" style={{ color: brandColors.dark }}>
                      Graduation Year
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        min={1900}
                        max={2100}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                        required
                        style={{ 
                          borderColor: brandColors.light
                        }}
                      />
                      <div className="absolute right-3 top-3" style={{ color: brandColors.primary }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
              whileHover={{ y: -5 }}
            >
              <div className="p-8">
                <motion.h2 
                  className="text-2xl font-semibold mb-6 flex items-center"
                  style={{ color: brandColors.dark }}
                >
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ backgroundColor: `${brandColors.primary}10` }}
                  >
                    <Code size={24} style={{ color: brandColors.primary }} />
                  </div>
                  <span>Creative Toolkit</span>
                </motion.h2>
                
                <div>
                  <label className="block text-sm font-medium mb-3 items-center">
                    <Globe className="mr-2" size={16} style={{ color: brandColors.primary }} />
                    <span style={{ color: brandColors.dark }}>Your Skills & Superpowers</span>
                  </label>
                  
                  <Select
                    isMulti
                    name="skills"
                    options={skillCategories}
                    value={skillCategories
                      .flatMap((category) => category.options)
                      .filter((option) => formData.skills.includes(option.value))}
                    onChange={handleSkillsChange}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select your creative skills..."
                    isSearchable
                    closeMenuOnSelect={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '52px',
                        borderColor: '#e5e7eb',
                        borderRadius: '12px',
                        '&:hover': {
                          borderColor: '#d1d5db',
                        },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: `${brandColors.primary}10`,
                        borderRadius: '8px',
                        padding: '2px 8px',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: brandColors.primary,
                        fontWeight: '500',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: brandColors.primary,
                        ':hover': {
                          backgroundColor: `${brandColors.primary}20`,
                          color: brandColors.primary,
                        },
                      }),
                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                      menu: base => ({ ...base, zIndex: 9999 })
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Story Section */}
            <motion.div 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
              whileHover={{ y: -5 }}
            >
              <div className="p-8">
                <motion.h2 
                  className="text-2xl font-semibold mb-6 flex items-center"
                  style={{ color: brandColors.dark }}
                >
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ backgroundColor: `${brandColors.primary}10` }}
                  >
                    <PenTool size={24} style={{ color: brandColors.primary }} />
                  </div>
                  <span>Your Creative Narrative</span>
                </motion.h2>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-2 items-center">
                      <Megaphone className="mr-2" size={16} style={{ color: brandColors.primary }} />
                      <span style={{ color: brandColors.dark }}>Creative Pitch</span>
                    </label>
                    <textarea
                      name="shortIntroduction"
                      value={formData.shortIntroduction}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="Your unique value proposition in 2-3 sentences..."
                      style={{ 
                        borderColor: brandColors.light
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 items-center">
                      <BookOpen className="mr-2" size={16} style={{ color: brandColors.primary }} />
                      <span style={{ color: brandColors.dark }}>Your Creative Journey</span>
                    </label>
                    <textarea
                      name="aboutMe"
                      value={formData.aboutMe}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                      placeholder="Tell your story... What drives you? What unique perspectives do you bring?"
                      style={{ 
                        borderColor: brandColors.light
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 items-center">
                        <Linkedin className="mr-2" size={16} style={{ color: brandColors.primary }} />
                        <span style={{ color: brandColors.dark }}>LinkedIn</span>
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="https://linkedin.com/in/yourname"
                        style={{ 
                          borderColor: brandColors.light
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 items-center">
                        <Github className="mr-2" size={16} style={{ color: brandColors.dark }} />
                        <span style={{ color: brandColors.dark }}>GitHub</span>
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="https://github.com/yourname"
                        style={{ 
                          borderColor: brandColors.light
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 items-center">
                        <FileText className="mr-2" size={16} style={{ color: brandColors.primary }} />
                        <span style={{ color: brandColors.dark }}>Portfolio/Resume</span>
                      </label>
                      <input
                        type="url"
                        name="resume"
                        value={formData.resume}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="https://yourportfolio.com"
                        style={{ 
                          borderColor: brandColors.light
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div 
              className="flex justify-center sticky bottom-6 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="submit"
                className="flex items-center justify-center px-10 py-4 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                disabled={mutation.isPending}
                whileHover={{ scale: mutation.isPending ? 1 : 1.05 }}
                whileTap={{ scale: mutation.isPending ? 1 : 0.97 }}
                style={{ 
                  background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
                  boxShadow: `0 8px 24px ${brandColors.primary}40`,
                }}
              >
                {mutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Crafting Your Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-3" size={20} />
                    Publish Your Creative Profile
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </div>

      <style jsx global>{`
        .react-select-container .react-select__control {
          border-radius: 0.75rem;
          border-color: #e5e7eb;
          min-height: 52px;
          transition: all 0.2s;
          padding: 0 8px;
        }
        .react-select-container .react-select__control:hover {
          border-color: #d1d5db;
        }
        .react-select-container .react-select__control--is-focused {
          border-color: transparent;
          box-shadow: 0 0 0 3px ${brandColors.primary}20;
        }
        .react-select-container .react-select__menu {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          margin-top: 4px;
        }
        .react-select-container .react-select__option--is-focused {
          background-color: ${brandColors.primary}10;
        }
        .react-select-container .react-select__option--is-selected {
          background-color: ${brandColors.primary};
          color: white;
        }
        .react-select-container .react-select__multi-value {
          background-color: ${brandColors.primary}10;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        .react-select-container .react-select__multi-value__label {
          color: ${brandColors.primary};
          font-size: 0.875rem;
          font-weight: 500;
          padding: 2px 6px;
        }
        .react-select-container .react-select__multi-value__remove {
          border-radius: 0 8px 8px 0;
          color: ${brandColors.primary};
        }
        .react-select-container .react-select__multi-value__remove:hover {
          background-color: ${brandColors.primary}20;
          color: ${brandColors.primary};
        }
      `}</style>
    </div>
  );
};

export default EditProfilePage;