"use client";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Modal from "../../modal";
import BusinessSidebar from "@/components/BusinessSidebar";
import { MarkdownTextEditor } from "@/components/MarkdownTextEditor";
import { FileUpload } from "@/components/FileUpload";
import { MultiSelect } from "@/components/MultiSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



export default function CreateCompetition() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    categories: [],
    coverImage: null,
    logo: null,
    organizerName: "",
    organizerDescription: "",
    contactEmail: "",
    phone: "",
    website: "",
    rules: "",
    eligibility: [],
    prizes: [{ 
      title: "", 
      description: "", 
      value: "",
      type: "cash" // Add prize type
    }],
    numberOfRounds: 1,
    rounds: [
      {
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        deliverables: "",
        judgingMethod: "",
        criteria: ""
      }
    ],
    participationType: "individual", 
    teamFormation: "self",
    minTeamSize: 1,
    maxTeamSize: 5,
    visibility: "public",
    audienceLevel: "open",
    startDate: "",
    endDate: "",
    customInviteLink: ""

  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [competition, setCompetition] = useState(null);
  const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
};


  const steps = [
    "Competition Identity",
    "Organizer Info",
    "Rules & Prizes",
    "Rounds & Teams",
    "Preview & Publish"
  ];

  const categoryOptions = [
    "Technology", "Business", "Design", "Science", "Arts",
    "Sports", "Education", "Health", "Social Good", "Other"
  ];

  const eligibilityOptions = [
    "Open to students",
    "Open to professionals",
    "Age restriction (18+)",
    "Regional restriction",
    "Team size restriction"
  ];

  const teamFormationOptions = [
    { value: "self", label: "Self-formed teams" },
    { value: "assigned", label: "Assigned teams" },
    { value: "mixed", label: "Both options available" }
  ];

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "invite", label: "Invite-only" }
  ];

  const audienceOptions = [
    { value: "university", label: "University" },
    { value: "highschool", label: "High School" },
    { value: "open", label: "Open to all" }
  ];

  useEffect(() => {
    // Only auto-fill if fields are empty
    const shouldAutoFill = !formData.organizerName && !formData.contactEmail;
    
    if (shouldAutoFill) {
      // Fetch organizer info from user profile or other source
      const fetchOrganizerInfo = async () => {
        try {
          const response = await fetch('/api/business');
          const organizerInfo = await response.json();
          
          setFormData(prev => ({
            ...prev,
            organizerName: organizerInfo.name || '',
            contactEmail: organizerInfo.email || '',
            website: organizerInfo.website || '',
            organizerDescription: organizerInfo.bio || ''

          }));
        } catch (error) {
          console.error("Failed to fetch organizer info:", error);
        }
      };
      
      fetchOrganizerInfo();
    }
  }, []); // Empty dependency array to run only once on mount

  // General input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const participationTypeOptions = [
    { value: "individual", label: "Individual" },
    { value: "team", label: "Team" }
  ];

  // Rich text editor handler
  const handleRichTextChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // File input change handler
  const handleFileChange = async (name, file) => {
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name); // Add filename to the form data

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const { imageUrl } = await response.json();
    setFormData(prev => ({ ...prev, [name]: imageUrl }));
  } catch (error) {
    console.error(`Failed to upload ${name}:`, error);
    setError(`Failed to upload ${name}. ${error.message}`);
  }
};

  // Category selection handler
  const handleCategoryChange = (selectedCategories) => {
    setFormData(prev => ({ ...prev, categories: selectedCategories }));
  };

  // Eligibility checkbox handler
  const handleEligibilityChange = (selectedOptions) => {
    setFormData(prev => ({ ...prev, eligibility: selectedOptions }));
  };

  // Promotion channel handler

  // Prize structure handlers
  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index][field] = value;
    setFormData(prev => ({ ...prev, prizes: updatedPrizes }));
  };

  const prizeTypeOptions = [
    { value: "cash", label: "Cash Prize" },
    { value: "scholarship", label: "Scholarship" },
    { value: "internship", label: "Internship" },
    { value: "product", label: "Product/Service" },
    { value: "other", label: "Other" }
  ];

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { title: "", description: "", value: "" }]
    }));
  };

  const removePrize = (index) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes.splice(index, 1);
    setFormData(prev => ({ ...prev, prizes: updatedPrizes }));
  };

  // Round handlers
  // In your component's state management or form handling code:

  const handleRoundChange = (index, field, value) => {
    setFormData(prev => {
      const newRounds = [...prev.rounds];
      const round = { ...newRounds[index], [field]: value };
      
      // Convert dates to Date objects for comparison
      const roundStartDate = round.startDate ? new Date(round.startDate) : null;
      const roundEndDate = round.endDate ? new Date(round.endDate) : null;
      const compStartDate = prev.startDate ? new Date(prev.startDate) : null;
      const compEndDate = prev.endDate ? new Date(prev.endDate) : null;
      const prevRoundEndDate = index > 0 && prev.rounds[index-1].endDate 
        ? new Date(prev.rounds[index-1].endDate)
        : null;
      const nextRoundStartDate = index < prev.rounds.length - 1 && prev.rounds[index+1].startDate
        ? new Date(prev.rounds[index+1].startDate)
        : null;
  
      // If updating start date
      if (field === 'startDate') {
        // Must be after competition start date
        if (compStartDate && roundStartDate && roundStartDate < compStartDate) {
          setError(`Round ${index + 1} must start after competition start date (${formatDate(prev.startDate)})`);
          return prev;
        }
        
        // Must be after previous round's end date (if exists)
        if (prevRoundEndDate && roundStartDate && roundStartDate < prevRoundEndDate) {
          setError(`Round ${index + 1} must start after Round ${index} ends (${formatDate(prev.rounds[index-1].endDate)})`);
          return prev;
        }
        
        // Must be before competition end date
        if (compEndDate && roundStartDate && roundStartDate > compEndDate) {
          setError(`Round ${index + 1} must start before competition ends (${formatDate(prev.endDate)})`);
          return prev;
        }
        
        // If we have an end date and the new start date is after it, clear end date
        if (roundEndDate && roundStartDate && roundStartDate > roundEndDate) {
          round.endDate = "";
        }
      }
      
      // If updating end date
      if (field === 'endDate') {
        // Must be after start date (if exists)
        if (roundStartDate && roundEndDate && roundEndDate < roundStartDate) {
          setError(`Round ${index + 1} end date must be after start date (${formatDate(round.startDate)})`);
          return prev;
        }
        
        // Must be before competition end date
        if (compEndDate && roundEndDate && roundEndDate > compEndDate) {
          setError(`Round ${index + 1} must end before competition ends (${formatDate(prev.endDate)})`);
          return prev;
        }
        
        // Must be before next round's start date (if exists)
        if (nextRoundStartDate && roundEndDate && roundEndDate > nextRoundStartDate) {
          setError(`Round ${index + 1} must end before Round ${index + 2} starts (${formatDate(prev.rounds[index+1].startDate)})`);
          return prev;
        }
      }
      
      newRounds[index] = round;
      setError(null);
      return { ...prev, rounds: newRounds };
    });
  };

const addRound = () => {
  setFormData(prev => {
    const lastRound = prev.rounds[prev.rounds.length - 1];
    const defaultStartDate = lastRound?.endDate || '';
    
    return {
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          name: `Round ${prev.rounds.length + 1}`,
          description: "",
          startDate: defaultStartDate,
          endDate: "",
          deliverables: "",
          judgingMethod: "",
          criteria: ""
        }
      ],
      numberOfRounds: prev.numberOfRounds + 1
    };
  });
};

const removeRound = (index) => {
  setFormData(prev => {
    const newRounds = [...prev.rounds];
    newRounds.splice(index, 1);
    
    // Adjust the numbering of remaining rounds
    const adjustedRounds = newRounds.map((round, i) => ({
      ...round,
      name: `Round ${i + 1}`
    }));
    
    return {
      ...prev,
      rounds: adjustedRounds,
      numberOfRounds: adjustedRounds.length
    };
  });
};
  
  // And modify the addRound function to set default dates appropriately
  
  const validateRoundDates = () => {
    const { rounds } = formData;
    // Check all rounds have both dates if one is provided
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      
      if ((round.startDate && !round.endDate) || (!round.startDate && round.endDate)) {
        setError(`Round ${i+1} must have both start and end dates or neither`);
        return false;
      }
      
      if (round.startDate && round.endDate && new Date(round.startDate) > new Date(round.endDate)) {
        setError(`Round ${i+1} start date must be before end date`);
        return false;
      }
      
      if (i > 0 && round.startDate && rounds[i-1].endDate && 
          new Date(round.startDate) < new Date(rounds[i-1].endDate)) {
        setError(`Round ${i+1} must start after Round ${i} ends`);
        return false;
      }
    }
    
    return true;
  };




  // Generate invite link
  const generateInviteLink = () => {
    const randomToken = Math.random().toString(36).substring(2, 10);
    const inviteLink = `https://yourdomain.com/invite/${randomToken}`;
    setFormData(prev => ({ ...prev, customInviteLink: inviteLink }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Validation functions
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.title || !formData.tagline || !formData.description || formData.categories.length === 0) {
          setError('Please fill all required fields in Competition Identity');
          return false;
        }
        break;
      case 2:
        if (!formData.organizerName || !formData.contactEmail) {
          setError('Please fill all required fields in Organizer Info');
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 3:
        if (!formData.rules || formData.prizes.some(prize => !prize.title || !prize.description)) {
          setError('Please fill all required fields in Rules & Prizes (including all prize titles and descriptions)');
          return false;
        }
        break;
      case 4:
        if (formData.rounds.some(round => !round.name) || !formData.minTeamSize || !formData.maxTeamSize) {
          setError('Please fill all required fields in Rounds & Teams');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Add this function definition before your return statement
const isFormComplete = () => {
  // Check all required fields
  const requiredFields = [
    formData.title,
    formData.description,
    formData.tagline,
    formData.startDate,
    formData.endDate,
    formData.rules,
    formData.prizes?.length > 0,
    formData.minTeamSize,
    formData.maxTeamSize,
  ];

  // Return true only if all required fields have values
  return requiredFields.every(field => !!field);
};
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateCurrentStep()) return;

  setIsSubmitting(true);
  setError(''); // Clear previous errors

  try {
    const formDataToSend = new FormData();
    
    // Append all simple fields
    const simpleFields = {
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      organizerName: formData.organizerName,
      organizerDescription: formData.organizerDescription || '',
      contactEmail: formData.contactEmail,
      phone: formData.phone || '',
      website: formData.website || '',
      rules: formData.rules,
      participationType: formData.participationType,
      teamFormation: formData.teamFormation,
      minTeamSize: String(formData.minTeamSize),
      maxTeamSize: String(formData.maxTeamSize),
      visibility: formData.visibility,
      audienceLevel: formData.audienceLevel,
      startDate: formData.startDate,
      endDate: formData.endDate,
      customInviteLink: formData.customInviteLink || '',
      // Add the URLs directly instead of files
      coverImage: formData.coverImage || '', // This should be the URL from Cloudinary
      logo: formData.logo || '' // This should be the URL from Cloudinary
    };

    Object.entries(simpleFields).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // Stringify and append complex fields
    const complexFields = {
      categories: formData.categories,
      eligibility: formData.eligibility,
      prizes: formData.prizes,
      rounds: formData.rounds
    };

    Object.entries(complexFields).forEach(([key, value]) => {
      formDataToSend.append(key, JSON.stringify(value));
    });

    // Handle file uploads
    if (formData.coverImage) formDataToSend.append('coverImage', formData.coverImage);
    if (formData.logo) formDataToSend.append('logo', formData.logo);

    const response = await fetch('/api/competitions', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create competition');
    }

    const data = await response.json();
    if (!data?.id) {
      throw new Error('Invalid competition data received');
    }
    setCompetition(data);

    // Notification code
try {
  const notifyResponse = await fetch('/api/notification/notify-students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      competitionId: data.id,
      competitionTitle: formData.title,
      organizerName: formData.organizerName || session.user.name
    }),
  });

  if (!notifyResponse.ok) {
    const errorData = await notifyResponse.json();
    console.error("Failed to notify students:", errorData.error || "Unknown error");
    // Consider adding a toast notification for the user
    // toast.error("Failed to send notifications to students");
  } else {
    const notificationData = await notifyResponse.json();
    console.log(`Successfully notified ${notificationData.count} students`);
  }
} catch (notificationError) {
  console.error("Notification error:", notificationError);
  // Consider adding a toast notification for the user
  // toast.error("Error sending notifications");
}

    setShowSuccessModal(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};


  const renderStep = () => {
    switch(currentStep) {
      case 1:
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl max-w-6xl mx-auto">
      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span 
              className="text-white p-3 rounded-2xl mr-4 shadow-lg"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span 
              className="bg-clip-text text-transparent tracking-tight"
              style={{ backgroundImage: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              Craft Your Competition
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-base font-medium">Shape an unforgettable experience for participants</p>
        </div>
        <div className="flex space-x-3">
          <span 
            className="px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm border"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              borderColor: `${brandColors.primary}20`
            }}
          >
            Step 1: Identity
          </span>
        </div>
      </div>
  
      {/* Enhanced error message */}
      {error && (
        <div 
          className="mb-8 p-5 border rounded-xl flex items-start animate-fade-in backdrop-blur-sm"
          style={{ 
            backgroundColor: `${brandColors.primary}10`,
            borderColor: `${brandColors.primary}20`
          }}
        >
          <div 
            className="flex-shrink-0 p-2 rounded-lg"
            style={{ backgroundColor: `${brandColors.primary}20` }}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: brandColors.primary }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: brandColors.primary }}
            >
              Attention needed
            </h3>
            <div className="mt-1 text-sm" style={{ color: brandColors.primary }}>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
  
      {/* Form content with premium styling */}
      <div className="space-y-10">
        {/* Competition Name */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Competition Name
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md"
              style={{ 
                '&:focus': {
                  borderColor: brandColors.primary,
                  boxShadow: `0 0 0 4px ${brandColors.primary}20`
                }
              }}
              placeholder="e.g. Global Innovation Challenge"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <svg 
                className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
  
        {/* Tagline */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Tagline
              <span className="ml-2 text-xs font-normal text-gray-500">(Make it catchy!)</span>
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="relative">
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="block w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 placeholder-gray-400 shadow-sm hover:shadow-md"
              style={{ 
                backgroundColor: `${brandColors.primary}05`,
                '&:focus': {
                  borderColor: brandColors.primary,
                  boxShadow: `0 0 0 4px ${brandColors.primary}20`
                }
              }}
              placeholder="A short, memorable phrase that sparks excitement"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <svg 
                className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>
  
        {/* Description */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Description
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-6 py-5 text-base border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md min-h-[180px]"
              style={{ 
                '&:focus': {
                  borderColor: brandColors.primary,
                  boxShadow: `0 0 0 4px ${brandColors.primary}20`
                }
              }}
              placeholder={`Describe your competition in detail...
  
      • What's the purpose?
      • Who is this for?
      • Why should people participate?
      • What makes it special?`}
              required
            />
            <div className="absolute bottom-4 right-4 flex items-center">
              <span className="text-xs text-gray-400">{formData.description.length}/1000</span>
            </div>
          </div>
        </div>
  
        {/* Category Tags */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Categories
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-2 group-hover:border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md">
            <MultiSelect
              options={categoryOptions}
              selected={formData.categories}
              onChange={handleCategoryChange}
              placeholder={
                <div className="flex items-center text-gray-400 pl-4 py-3">
                  <svg 
                    className="w-6 h-6 mr-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-base">Select 2-5 relevant categories</span>
                </div>
              }
              renderOption={(option) => (
                <div 
                  className="px-4 py-3 m-1 rounded-xl border border-gray-100 text-gray-800 font-medium flex items-center"
                  style={{ 
                    backgroundColor: `${brandColors.primary}10`,
                    borderColor: `${brandColors.primary}20`
                  }}
                >
                  {option.label}
                  <span 
                    className="ml-2 text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${brandColors.primary}20`,
                      color: brandColors.primary
                    }}
                  >
                    {option.count} competitions
                  </span>
                </div>
              )}
            />
          </div>
        </div>
  
        {/* Visual Identity Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span 
              className="text-white p-2 rounded-xl mr-3"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            Visual Branding
          </h3>
          <p className="text-gray-500 mb-6 text-base">Create a strong visual identity that participants will remember</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cover Image */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Hero Image
                </label>
                <span className="text-xs text-gray-500">Recommended: 1200×600px</span>
              </div>
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-5 group-hover:border-gray-400 transition-colors duration-200 bg-gray-50 shadow-inner hover:shadow-sm relative">
                {formData.coverImage ? (
                  <>
                    <div className="relative h-64 rounded-xl overflow-hidden">
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-cover.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h4 className="font-bold text-lg">{formData.title || 'Your Competition'}</h4>
                        <p className="text-sm opacity-90">{formData.tagline || 'Your tagline here'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-md flex items-center justify-center"
                      style={{ color: brandColors.primary }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <FileUpload
                    name="coverImage"
                    onChange={(file) => handleFileChange('coverImage', file)}
                    accept="image/*"
                    maxSize={5}
                    label={
                      <div className="text-center py-8">
                        <svg 
                          className="mx-auto h-14 w-14 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 className="mt-4 text-lg font-medium text-gray-700">Drag & drop hero image</h4>
                        <p className="mt-2 text-sm text-gray-500">or click to browse files (5MB max)</p>
                      </div>
                    }
                  />
                )}
              </div>
            </div>
            
            {/* Logo */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Logo
                </label>
                <span className="text-xs text-gray-500">Square format recommended</span>
              </div>
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-5 group-hover:border-gray-400 transition-colors duration-200 bg-gray-50 shadow-inner hover:shadow-sm relative">
                {formData.logo ? (
                  <>
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        <img
                          src={formData.logo}
                          alt="Logo preview"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-logo.png';
                          }}
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h4 className="font-medium text-gray-700">{formData.title || 'Your Brand'}</h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-md flex items-center justify-center"
                      style={{ color: brandColors.primary }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <FileUpload
                    name="logo"
                    onChange={(file) => handleFileChange('logo', file)}
                    accept="image/*"
                    maxSize={2}
                    circularPreview
                    label={
                      <div className="text-center py-8">
                        <svg 
                          className="mx-auto h-14 w-14 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="mt-4 text-lg font-medium text-gray-700">Upload your logo</h4>
                        <p className="mt-2 text-sm text-gray-500">or drag & drop here (2MB max)</p>
                      </div>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
  
        {/* Settings Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span 
              className="text-white p-2 rounded-xl mr-3"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Competition Settings
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visibility */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Visibility
                </label>
                <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
              </div>
              <div className="relative">
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="block w-full px-6 py-5 text-base border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white appearance-none shadow-sm hover:shadow-md"
                  style={{ 
                    '&:focus': {
                      borderColor: brandColors.primary,
                      boxShadow: `0 0 0 4px ${brandColors.primary}20`
                    }
                  }}
                >
                  {visibilityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                  <svg 
                    className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
  
            {/* Date Range */}
            <div className="space-y-6">
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Start Date
                  </label>
                  <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
                </div>
                <div className="border-2 border-gray-200 rounded-2xl p-1 shadow-sm hover:shadow-md transition-all">
                  <DatePicker
                    selected={formData.startDate ? new Date(formData.startDate) : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    selectsStart
                    startDate={formData.startDate ? new Date(formData.startDate) : null}
                    endDate={formData.endDate ? new Date(formData.endDate) : null}
                    className="block w-full px-5 py-4 text-base border-none focus:ring-2 focus:border-gray-300 rounded-xl"
                    placeholderText="Select start date"
                    dateFormat="MMMM d, yyyy"
                    required
                    isClearable
                    showTimeSelect={false}
                  />
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    End Date
                  </label>
                  <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
                </div>
                <div className="border-2 border-gray-200 rounded-2xl p-1 shadow-sm hover:shadow-md transition-all">
                  <DatePicker
                    selected={formData.endDate ? new Date(formData.endDate) : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    selectsEnd
                    startDate={formData.startDate ? new Date(formData.startDate) : null}
                    endDate={formData.endDate ? new Date(formData.endDate) : null}
                    minDate={formData.startDate ? new Date(formData.startDate) : null}
                    className="block w-full px-5 py-4 text-base border-none focus:ring-2 focus:border-gray-300 rounded-xl"
                    placeholderText="Select end date"
                    dateFormat="MMMM d, yyyy"
                    required
                    isClearable
                    showTimeSelect={false}
                  />
                </div>
                {formData.startDate && formData.endDate && (
                  <p className="mt-2 text-sm text-gray-500">
                    Duration: {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 2:
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl max-w-6xl mx-auto">
      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span 
              className="text-white p-3 rounded-2xl mr-4 shadow-lg"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <span 
              className="bg-clip-text text-transparent tracking-tight"
              style={{ backgroundImage: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              Organizer Details
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-base font-medium">Tell participants about your organization</p>
        </div>
        <div className="flex space-x-3">
          <span 
            className="px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm border"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              borderColor: `${brandColors.primary}20`
            }}
          >
            Step 2: Organizer Info
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                organizerName: '',
                contactEmail: '',
                website: '',
                phone: '',
                organizerDescription: ''
              }));
            }}
            className="flex items-center text-sm transition-colors"
            style={{ color: brandColors.primary }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset Form
          </button>
        </div>
      </div>

      {/* Enhanced error message */}
      {error && (
        <div 
          className="mb-8 p-5 border rounded-xl flex items-start animate-fade-in backdrop-blur-sm"
          style={{ 
            backgroundColor: `${brandColors.primary}10`,
            borderColor: `${brandColors.primary}20`
          }}
        >
          <div 
            className="flex-shrink-0 p-2 rounded-lg"
            style={{ backgroundColor: `${brandColors.primary}20` }}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: brandColors.primary }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: brandColors.primary }}
            >
              Attention needed
            </h3>
            <div className="mt-1 text-sm" style={{ color: brandColors.primary }}>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form content with premium styling */}
      <div className="space-y-10">
        {/* Organizer Name */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Organization Name
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="relative">
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              className="block w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md"
              style={{ 
                '&:focus': {
                  borderColor: brandColors.primary,
                  boxShadow: `0 0 0 4px ${brandColors.primary}20`
                }
              }}
              placeholder="Your company or organization name"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <svg 
                className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="group">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                Contact Email
              </label>
              <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
            </div>
            <div className="relative">
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="block w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 placeholder-gray-400 shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: `${brandColors.primary}05`,
                  '&:focus': {
                    borderColor: brandColors.primary,
                    boxShadow: `0 0 0 4px ${brandColors.primary}20`
                  }
                }}
                placeholder="contact@yourorganization.com"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <svg 
                  className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-gray-900 transition-colors">
              Phone (optional)
            </label>
            <div className="flex rounded-2xl overflow-hidden shadow-sm border-2 border-gray-200 group-hover:border-gray-400 transition-colors duration-200">
              <select 
                className="w-1/4 p-5 bg-gray-50 text-gray-700 focus:outline-none text-lg"
                value={formData.phoneCode || '+1'}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneCode: e.target.value }))}
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
              </select>
              <div className="relative w-3/4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-5 text-lg focus:outline-none"
                  placeholder="123-456-7890"
                />
                {formData.phone && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, phone: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear field"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Website */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-gray-900 transition-colors">
            Website / Social Links (optional)
          </label>
          <div className="relative">
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="block w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md"
              style={{ 
                '&:focus': {
                  borderColor: brandColors.primary,
                  boxShadow: `0 0 0 4px ${brandColors.primary}20`
                }
              }}
              placeholder="https://yourorganization.com"
            />
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
              <svg 
                className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">You can add social media links like Twitter, Instagram, etc.</p>
        </div>

        {/* Description */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-gray-900 transition-colors">
            Organization Description
          </label>
          <textarea
            name="organizerDescription"
            value={formData.organizerDescription}
            onChange={handleChange}
            className="block w-full px-6 py-5 text-base border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md min-h-[180px]"
            style={{ 
              '&:focus': {
                borderColor: brandColors.primary,
                boxShadow: `0 0 0 4px ${brandColors.primary}20`
              }
            }}
            placeholder={`Describe your organization in detail...
            
• What's your mission?
• What makes you unique?
• Why should participants trust you?`}
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">This helps build credibility with participants</p>
            <span className="text-xs text-gray-400">{formData.organizerDescription.length}/500</span>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span 
              className="text-white p-2 rounded-xl mr-3"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </span>
            Social Proof (optional)
          </h3>
          <p className="text-gray-500 mb-6 text-base">Add social media links to increase trust and engagement</p>
          
          <div className="flex flex-wrap gap-3">
            {[
              { icon: 'facebook', color: 'bg-blue-500', label: 'Facebook' },
              { icon: 'twitter', color: 'bg-blue-400', label: 'Twitter' },
              { icon: 'instagram', color: 'bg-pink-600', label: 'Instagram' },
              { icon: 'linkedin', color: 'bg-blue-700', label: 'LinkedIn' },
              { icon: 'youtube', color: 'bg-red-600', label: 'YouTube' },
              { icon: 'tiktok', color: 'bg-black', label: 'TikTok' }
            ].map((social, index) => (
              <button
                key={index}
                type="button"
                className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${social.color}, ${social.color}00)`,
                  backdropFilter: 'blur(5px)'
                }}
              >
                <span className="w-5 h-5 mr-2 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    {/* Social media icons would go here */}
                  </svg>
                </span>
                {social.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  case 3:
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl max-w-6xl mx-auto">
      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span 
              className="text-white p-3 rounded-2xl mr-4 shadow-lg"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <span 
              className="bg-clip-text text-transparent tracking-tight"
              style={{ backgroundImage: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              Competition Setup
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-base font-medium">Define the rules, eligibility, and prizes for your competition</p>
        </div>
        <div className="flex space-x-3">
          <span 
            className="px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm border"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              borderColor: `${brandColors.primary}20`
            }}
          >
            Step 3: Setup
          </span>
        </div>
      </div>

      {/* Enhanced error message */}
      {error && (
        <div 
          className="mb-8 p-5 border rounded-xl flex items-start animate-fade-in backdrop-blur-sm"
          style={{ 
            backgroundColor: `${brandColors.primary}10`,
            borderColor: `${brandColors.primary}20`
          }}
        >
          <div 
            className="flex-shrink-0 p-2 rounded-lg"
            style={{ backgroundColor: `${brandColors.primary}20` }}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: brandColors.primary }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: brandColors.primary }}
            >
              Attention needed
            </h3>
            <div className="mt-1 text-sm" style={{ color: brandColors.primary }}>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form content with premium styling */}
      <div className="space-y-10">
        {/* Rules & Guidelines */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Rules & Guidelines
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <MarkdownTextEditor
              value={formData.rules}
              onChange={(content) => setFormData(prev => ({...prev, rules: content}))}
              placeholder={`# Competition Rules

## General Guidelines
- All participants must register before submitting
- Submissions must be original work
- Follow all ethical guidelines

## Submission Requirements
- File formats: PDF, JPG, PNG, MP4
- Max file size: 10MB per submission
- Include a README with project details

## Judging Criteria

### Creativity (30%)
- Originality of concept
- Innovative approach
- Artistic expression

### Technical Skill (40%)
- Implementation quality
- Technical complexity
- Functionality

### Originality (30%)
- Unique solution
- Novel application of ideas
- Distinctive features`}
              className="min-h-[200px] w-full px-6 py-5 text-base border-none rounded-2xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400"
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">Supports markdown formatting. Be clear and specific.</p>
        </div>
        
        {/* Eligibility Requirements */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Eligibility Requirements
            </label>
            <span className="text-xs text-gray-500">Select all that apply</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all">
            <MultiSelect
              options={eligibilityOptions}
              selected={formData.eligibility}
              onChange={handleEligibilityChange}
              placeholder={
                <div className="flex items-center text-gray-400 pl-4 py-3">
                  <svg 
                    className="w-6 h-6 mr-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-base">Who can participate?</span>
                </div>
              }
              renderOption={(option) => (
                <div 
                  className="px-4 py-3 m-1 rounded-xl border border-gray-100 text-gray-800 font-medium flex items-center"
                  style={{ 
                    backgroundColor: `${brandColors.primary}10`,
                    borderColor: `${brandColors.primary}20`
                  }}
                >
                  {option.label}
                </div>
              )}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">Leave empty if open to all participants</p>
        </div>
        
        {/* Prize Structure */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Prize Structure
            </label>
            <span className="text-xs text-gray-500">Add at least one prize</span>
          </div>
          
          <div className="space-y-6">
            {formData.prizes.map((prize, index) => (
              <div key={index} className="p-6 border-2 border-gray-200 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow relative group">
                <div 
                  className="absolute -top-3 -left-3 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {index === 0 ? 'Grand Prize' : `Rank ${index + 1}`}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prize Title *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={prize.title}
                        onChange={(e) => handlePrizeChange(index, 'title', e.target.value)}
                        className="block w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400"
                        placeholder="e.g. Best Design Award"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <svg 
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Value / Reward</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={prize.value}
                        onChange={(e) => handlePrizeChange(index, 'value', e.target.value)}
                        className="block w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 pl-10"
                        placeholder="5,000"
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prize Type</label>
                    <div className="relative">
                      <select
                        value={prize.type}
                        onChange={(e) => handlePrizeChange(index, 'type', e.target.value)}
                        className="block w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white appearance-none"
                      >
                        {prizeTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <svg 
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prize Description *</label>
                  <textarea
                    value={prize.description}
                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                    className="block w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 min-h-[100px]"
                    placeholder="What makes this prize special? Include any conditions or details."
                    required
                  />
                </div>
                
                {formData.prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="absolute -top-4 -right-4 bg-white text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50 border border-red-100"
                    aria-label="Remove prize"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addPrize}
            className="mt-6 px-6 py-4 text-base font-medium rounded-xl transition-colors flex items-center justify-center shadow-sm w-full hover:shadow-md"
            style={{ 
              backgroundColor: brandColors.primary,
              color: 'white',
              '&:hover': {
                backgroundColor: brandColors.secondary
              }
            }}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Prize
          </button>
          
          <div 
            className="mt-6 p-5 rounded-xl border flex items-start"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              borderColor: `${brandColors.primary}20`
            }}
          >
            <div 
              className="flex-shrink-0 p-2 rounded-lg mr-4"
              style={{ backgroundColor: `${brandColors.primary}20` }}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: brandColors.primary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: brandColors.primary }}>
              Tip: Offering multiple prize tiers increases participation. Consider adding non-monetary rewards like mentorship opportunities or featured spots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  case 4:
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl max-w-6xl mx-auto">
      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span 
              className="text-white p-3 rounded-2xl mr-4 shadow-lg"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span 
              className="bg-clip-text text-transparent tracking-tight"
              style={{ backgroundImage: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              Competition Structure
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-base font-medium">Define the rounds and participation rules for your competition</p>
        </div>
        <div className="flex space-x-3">
          <span 
            className="px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm border"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              borderColor: `${brandColors.primary}20`
            }}
          >
            Step 4: Structure
          </span>
        </div>
      </div>

      {/* Enhanced error message */}
      {error && (
        <div 
          className="mb-8 p-5 border rounded-xl flex items-start animate-fade-in backdrop-blur-sm"
          style={{ 
            backgroundColor: `${brandColors.primary}10`,
            borderColor: `${brandColors.primary}20`
          }}
        >
          <div 
            className="flex-shrink-0 p-2 rounded-lg"
            style={{ backgroundColor: `${brandColors.primary}20` }}
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: brandColors.primary }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: brandColors.primary }}
            >
              Attention needed
            </h3>
            <div className="mt-1 text-sm" style={{ color: brandColors.primary }}>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form content with premium styling */}
      <div className="space-y-10">
        {/* Rounds Configuration */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Competition Rounds
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm text-gray-500 mb-3">How many rounds will your competition have?</label>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const rounds = [...prev.rounds];
                      while (rounds.length < num) {
                        rounds.push({
                          name: `Round ${rounds.length + 1}`,
                          description: "",
                          startDate: "",
                          endDate: "",
                          deliverables: "",
                          judgingMethod: "",
                          criteria: ""
                        });
                      }
                      while (rounds.length > num) {
                        rounds.pop();
                      }
                      return { ...prev, numberOfRounds: num, rounds };
                    });
                  }}
                  className={`px-5 py-3 rounded-xl border-2 transition-colors font-medium ${
                    formData.numberOfRounds === num 
                      ? `border-primary bg-primary text-white shadow-md` 
                      : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {num} {num === 1 ? 'Round' : 'Rounds'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {formData.rounds.map((round, index) => (
              <div key={index} className="p-6 border-2 border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span 
                      className="text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      {index + 1}
                    </span>
                    <h4 className="font-medium text-gray-900">Round Configuration</h4>
                  </div>
                  {formData.rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove round"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Round Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={round.name}
                        onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                        className="block w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md"
                        placeholder="e.g. Preliminary Judging"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <svg 
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={round.description}
                      onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                      className="block w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md min-h-[100px]"
                      placeholder="What makes this round unique? Describe the purpose and activities."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                      <div className="border-2 border-gray-200 rounded-xl p-1 shadow-sm hover:shadow-md transition-all">
                        <DatePicker
                          selected={round.startDate ? new Date(round.startDate) : null}
                          onChange={(date) => {
                            const formattedDate = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';
                            handleRoundChange(index, 'startDate', formattedDate);
                          }}
                          selectsStart
                          startDate={round.startDate ? new Date(round.startDate) : null}
                          endDate={round.endDate ? new Date(round.endDate) : null}
                          minDate={
                            index > 0 && formData.rounds[index-1].endDate 
                              ? new Date(formData.rounds[index-1].endDate)
                              : formData.startDate 
                                ? new Date(formData.startDate)
                                : null
                          }
                          maxDate={formData.endDate ? new Date(formData.endDate) : null}
                          className="block w-full px-5 py-4 text-base border-none focus:ring-2 focus:border-gray-300 rounded-xl"
                          placeholderText="Select start date"
                          dateFormat="MMMM d, yyyy"
                          required
                          isClearable
                          showTimeSelect={false}
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                      <div className="border-2 border-gray-200 rounded-xl p-1 shadow-sm hover:shadow-md transition-all">
                        <DatePicker
                          selected={round.endDate ? new Date(round.endDate) : null}
                          onChange={(date) => {
                            const formattedDate = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';
                            handleRoundChange(index, 'endDate', formattedDate);
                          }}
                          selectsEnd
                          startDate={round.startDate ? new Date(round.startDate) : null}
                          endDate={round.endDate ? new Date(round.endDate) : null}
                          minDate={
                            round.startDate 
                              ? new Date(round.startDate)
                              : index > 0 && formData.rounds[index-1].endDate 
                                ? new Date(formData.rounds[index-1].endDate)
                                : formData.startDate 
                                  ? new Date(formData.startDate)
                                  : null
                          }
                          maxDate={formData.endDate ? new Date(formData.endDate) : null}
                          className="block w-full px-5 py-4 text-base border-none focus:ring-2 focus:border-gray-300 rounded-xl"
                          placeholderText="Select end date"
                          dateFormat="MMMM d, yyyy"
                          required
                          isClearable
                          showTimeSelect={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Required Deliverables</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={round.deliverables}
                        onChange={(e) => handleRoundChange(index, 'deliverables', e.target.value)}
                        className="block w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md"
                        placeholder="e.g. Video submission, prototype photos, code repository"
                      />
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <svg 
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judging Method</label>
                    <div className="relative">
                      <select
                        value={round.judgingMethod}
                        onChange={(e) => handleRoundChange(index, 'judgingMethod', e.target.value)}
                        className="block w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white appearance-none shadow-sm hover:shadow-md"
                      >
                        <option value="">Select judging method</option>
                        <option value="panel">Expert Panel</option>
                        <option value="community">Community Voting</option>
                        <option value="hybrid">Hybrid Approach</option>
                        <option value="automated">Automated Testing</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <svg 
                          className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Evaluation Criteria</label>
                    <textarea
                      value={round.criteria}
                      onChange={(e) => handleRoundChange(index, 'criteria', e.target.value)}
                      className="block w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-gray-300 transition-all duration-200 bg-white placeholder-gray-400 shadow-sm hover:shadow-md min-h-[100px]"
                      placeholder="List the key factors judges will evaluate, with weights if applicable"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addRound}
            className="mt-6 px-6 py-4 text-base font-medium rounded-xl transition-colors flex items-center justify-center shadow-sm w-full hover:shadow-md"
            style={{ 
              backgroundColor: brandColors.primary,
              color: 'white',
              '&:hover': {
                backgroundColor: brandColors.secondary
              }
            }}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Round
          </button>
        </div>
        
        {/* Participation Settings */}
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              Participation Settings
            </label>
            <span className="text-xs font-medium" style={{ color: brandColors.primary }}>Required</span>
          </div>
          
          <div className="space-y-8">
            <div className="group">
              <label className="block text-sm text-gray-500 mb-3">How will participants compete?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participationTypeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        participationType: option.value,
                        ...(option.value === "individual" && {
                          minTeamSize: 1,
                          maxTeamSize: 1
                        })
                      }));
                    }}
                    className={`p-5 rounded-xl border-2 transition-colors text-left ${
                      formData.participationType === option.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 bg-white hover:bg-light'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 transition-colors ${
                          formData.participationType === option.value 
                            ? 'border-primary bg-primary flex items-center justify-center' 
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.participationType === option.value && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-dark">{option.label}</div>
                        <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {formData.participationType === "team" && (
              <>
                <div className="group">
                  <label className="block text-dark mb-3 font-medium">How will teams be formed? *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teamFormationOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange({ target: { name: "teamFormation", value: option.value } })}
                        className={`p-5 rounded-xl border-2 transition-colors text-left ${
                          formData.teamFormation === option.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 bg-white hover:bg-light'
                        }`}
                      >
                        <div className="flex items-center">
                          <div 
                            className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 ${
                              formData.teamFormation === option.value 
                                ? 'border-primary bg-primary flex items-center justify-center' 
                                : 'border-gray-300'
                            }`}
                          >
                            {formData.teamFormation === option.value && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-dark">{option.label}</div>
                            <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-dark mb-3 font-medium">Team Size Range *</label>
                    <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">Minimum</span>
                        <span className="text-sm text-gray-500">Maximum</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            name="minTeamSize"
                            value={formData.minTeamSize}
                            onChange={handleChange}
                            min="1"
                            max="20"
                            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-primary text-center transition-all"
                            style={{ 
                              '&:focus': {
                                borderColor: brandColors.primary,
                                boxShadow: `0 0 0 4px ${brandColors.primary}20`
                              }
                            }}
                            required
                          />
                        </div>
                        <span className="text-gray-400">to</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            name="maxTeamSize"
                            value={formData.maxTeamSize}
                            onChange={handleChange}
                            min={formData.minTeamSize}
                            max="20"
                            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:border-primary text-center transition-all"
                            style={{ 
                              '&:focus': {
                                borderColor: brandColors.primary,
                                boxShadow: `0 0 0 4px ${brandColors.primary}20`
                              }
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        {formData.minTeamSize === formData.maxTeamSize ? (
                          `All teams must have exactly ${formData.minTeamSize} members`
                        ) : (
                          `Teams can have ${formData.minTeamSize} to ${formData.maxTeamSize} members`
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-dark mb-3 font-medium">Team Size Visualizer</label>
                    <div className="bg-white p-5 rounded-xl border-2 border-gray-200 flex justify-center">
                      <div className="flex items-end space-x-2 h-24">
                        {Array.from({ length: formData.maxTeamSize }, (_, i) => (
                          <div 
                            key={i}
                            className={`w-8 rounded-t-lg transition-all ${
                              i < formData.minTeamSize 
                                ? 'bg-primary' 
                                : 'bg-accent'
                            }`}
                            style={{ height: `${(i + 1) * 10}px` }}
                            title={i < formData.minTeamSize ? 'Required members' : 'Optional members'}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-center text-gray-500">
                      Visual representation of team sizes
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  case 5:
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl max-w-6xl mx-auto">
      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <span 
              className="text-white p-3 rounded-2xl mr-4 shadow-lg"
              style={{ backgroundColor: brandColors.primary }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <span 
              className="bg-clip-text text-transparent tracking-tight"
              style={{ backgroundImage: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              Final Review
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-base font-medium">Preview your competition before publishing</p>
        </div>
        <div className="flex space-x-3">
          <span 
            className="px-5 py-2.5 text-sm font-semibold rounded-full shadow-sm border"
            style={{ 
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary,
              borderColor: `${brandColors.primary}20`
            }}
          >
            Step 5: Review
          </span>
        </div>
      </div>

      {/* Preview mode toggle */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Preview Mode:</span>
          <div 
            className="inline-flex bg-light rounded-xl p-1 border"
            style={{ borderColor: `${brandColors.primary}20` }}
          >
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${
                previewMode === "desktop" 
                  ? "bg-white shadow-sm text-primary border border-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ 
                backgroundColor: previewMode === "desktop" ? 'white' : 'transparent',
                color: previewMode === "desktop" ? brandColors.primary : 'inherit'
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center ${
                previewMode === "mobile" 
                  ? "bg-white shadow-sm text-primary border border-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ 
                backgroundColor: previewMode === "mobile" ? 'white' : 'transparent',
                color: previewMode === "mobile" ? brandColors.primary : 'inherit'
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview Container */}
      <div 
        className={`border-2 border-gray-200 rounded-2xl overflow-hidden mb-10 transition-all bg-white shadow-sm hover:shadow-md ${
          previewMode === "mobile" ? "max-w-xs mx-auto" : "w-full"
        }`}
      >
        <div className="p-8">
          {/* Competition Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{formData.title || "Your Competition Title"}</h3>
              <p className="text-gray-600 mt-3 text-lg">{formData.tagline || "Short engaging tagline"}</p>
            </div>
            {formData.featuredImage && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                <img 
                  src={formData.featuredImage} 
                  alt="Featured" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Key Info Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div 
              className="bg-white p-5 rounded-xl border-2 border-gray-200"
              style={{ backgroundColor: `${brandColors.primary}05` }}
            >
              <div className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColors.primary }}>Start</div>
              <div className="font-semibold mt-2 text-lg text-dark">
                {formData.startDate ? formatDate(formData.startDate) : "Not set"}
              </div>
            </div>
            <div 
              className="bg-white p-5 rounded-xl border-2 border-gray-200"
              style={{ backgroundColor: `${brandColors.primary}05` }}
            >
              <div className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColors.primary }}>End</div>
              <div className="font-semibold mt-2 text-lg text-dark">
                {formData.endDate ? formatDate(formData.endDate) : "Not set"}
              </div>
            </div>
            <div 
              className="bg-white p-5 rounded-xl border-2 border-gray-200"
              style={{ backgroundColor: `${brandColors.primary}05` }}
            >
              <div className="text-xs font-medium uppercase tracking-wider" style={{ color: brandColors.primary }}>Prize</div>
              <div className="font-semibold mt-2 text-lg text-dark truncate">
                {formData.prizes[0]?.title || "TBD"}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-10">
            <h4 className="font-semibold text-xl text-dark mb-4">Description</h4>
            {formData.description ? (
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: formData.description }} 
              />
            ) : (
              <div className="text-gray-400 italic">No description provided</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review Checklist */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-dark mb-6 flex items-center">
          <span 
            className="text-white p-2 rounded-xl mr-3"
            style={{ backgroundColor: brandColors.primary }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          Review Checklist
        </h3>
        
        <div className="space-y-6">
          {[
            { 
              title: "Basic Information", 
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: brandColors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              items: [
                { label: "Competition name", valid: !!formData.title },
                { label: "Description", valid: !!formData.description },
                { label: "Tagline", valid: !!formData.tagline },
                { label: "Dates set", valid: !!formData.startDate && !!formData.endDate }
              ]
            },
            {
              title: "Rules & Structure",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: brandColors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
              items: [
                { label: "Rules provided", valid: !!formData.rules },
                { label: "At least one prize", valid: formData.prizes?.length > 0 },
                { label: "Team settings", valid: !!formData.minTeamSize && !!formData.maxTeamSize }
              ]
            }
          ].map((section, i) => (
            <div key={i} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              <div 
                className="px-6 py-4 flex items-center gap-4"
                style={{ backgroundColor: `${brandColors.primary}05`, borderBottom: `1px solid ${brandColors.primary}20` }}
              >
                {section.icon}
                <h4 className="font-medium text-lg text-dark">{section.title}</h4>
              </div>
              <ul className="divide-y divide-gray-200">
                {section.items.map((item, j) => (
                  <li key={j} className="px-6 py-4 flex items-center">
                    {item.valid ? (
                      <span className="text-green-500 mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-gray-300 mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                    <span className={`text-base ${item.valid ? "text-gray-700" : "text-gray-500"}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-6 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-8 py-4 border-2 border-gray-200 rounded-xl text-base font-medium text-dark bg-white hover:bg-light transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Save as Draft
          </button>
          
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const later = new Date();
              later.setDate(later.getDate() + 1);
              
              setFormData(prev => ({
                ...prev,
                startDate: now.toISOString().split('T')[0],
                endDate: later.toISOString().split('T')[0]
              }));
            }}
            className="px-8 py-4 border-2 border-gray-200 rounded-xl text-base font-medium text-dark bg-white hover:bg-light transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule for Tomorrow
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!isFormComplete()}
          className={`px-10 py-4 rounded-xl text-base font-medium text-white transition-all flex items-center justify-center shadow-lg ${
            isFormComplete() 
              ? `bg-gradient-to-r from-primary to-secondary hover:from-${brandColors.primary.replace('#', '')} hover:to-${brandColors.secondary.replace('#', '')}` 
              : "bg-gray-300 cursor-not-allowed"
          }`}
          style={{ 
            background: isFormComplete() 
              ? `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})` 
              : undefined
          }}
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Publish Now
        </button>
      </div>
    </div>
  );
  default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BusinessSidebar activeTab="create-competition" />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Competition</h1>
          
          {/* Enhanced Progress Stepper */}
<div className="mb-10">
  <div className="flex justify-between relative">
    {/* Progress line */}
    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
      <div 
        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ease-in-out"
        style={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
        }}
      ></div>
    </div>

    {steps.map((step, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        {/* Step circle */}
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
            index + 1 < currentStep 
              ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-200" 
              : index + 1 === currentStep
              ? "bg-gradient-to-br from-orange-600 to-amber-600 ring-4 ring-orange-200 shadow-lg"
              : "bg-gray-100 border-2 border-gray-300"
          }`}
        >
          {index + 1 < currentStep ? (
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className={`font-medium ${
              index + 1 === currentStep ? "text-white" : "text-gray-500"
            }`}>
              {index + 1}
            </span>
          )}
        </div>
        
        {/* Step label */}
        <span className={`text-sm font-medium text-center px-2 ${
          index + 1 <= currentStep 
            ? "text-orange-800 font-semibold" 
            : "text-gray-500"
        }`}>
          {step}
        </span>
        
        {/* Optional tooltip on hover */}
        {index + 1 > currentStep && (
          <div className="absolute top-12 mt-2 px-3 py-1 bg-white text-orange-700 text-xs font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Complete step {currentStep} to unlock
          </div>
        )}
      </div>
    ))}
  </div>
</div>
          
          <form onSubmit={currentStep === steps.length ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {renderStep()}
            
            <div className="mt-6 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                className={`ml-auto px-4 py-2 rounded-md text-sm font-medium ${
                  currentStep === steps.length
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentStep === steps.length ? "Publishing..." : "Processing..."}
                  </>
                ) : (
                  currentStep === steps.length ? "Publish Competition" : "Continue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Enhanced Success Modal */}
      {/* Success Modal */}
      <Modal 
  isOpen={showSuccessModal} 
  onClose={() => {
    setShowSuccessModal(false); // ONLY close the modal, no redirect here
  }}
>
  <div className="text-center p-8 max-w-md mx-auto">
    {/* Confetti Animation Container */}
    <div className="relative overflow-hidden rounded-lg">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{ 
            opacity: 0,
            y: -10,
            x: Math.random() * 100 - 50
          }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [0, Math.random() * 100 + 50],
            x: Math.random() * 100 - 50,
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            repeat: Infinity,
            repeatDelay: 5
          }}
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: [
              '#fbbf24', // yellow-400
              '#60a5fa', // blue-400
              '#34d399', // emerald-400
              '#f472b6'  // pink-400
            ][Math.floor(Math.random() * 4)]
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 bg-white p-6 rounded-lg">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
        <p className="text-gray-600 mb-6">
          Your competition "{formData.title}" is now live and ready for participants.
        </p>
        
        {/* Celebration Animation */}
        <motion.div 
          className="mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
        >
          <div className="text-5xl">🎉</div>
        </motion.div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setShowSuccessModal(false);
              if (competition?.id) {
                router.push(`/business-dashboard/competitions/${competition.id}`);
              }
            }}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            Edit Competition Details
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSuccessModal(false);
              if (competition?.id) {
                router.push(`/competitions/${competition.id}`);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            View Public Page
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSuccessModal(false);
              router.push("/business-dashboard/competitions");
            }}
            className="w-full px-4 py-3 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Back to All Competitions
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>


    </div>
  );
}
// Helper function to validate files
function validateFile(file, maxSizeMB, allowedTypes) {
  if (!file) return false;
  
  // Check file size (maxSizeMB in megabytes)
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return false;
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type.split('/')[0];
    if (!allowedTypes.includes(fileType)) {
      return false;
    }
  }
  
  return true;
}