"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { 
  FaEdit, 
  FaGlobe, 
  FaLinkedin, 
  FaPhone, 
  FaEnvelope, 
  FaSave, 
  FaPaintBrush, 
  FaBuilding, 
  FaMapMarkerAlt,
  FaLightbulb,
  FaPalette,
  FaChevronDown
} from "react-icons/fa";
import { FiUpload, FiAward } from "react-icons/fi";
import { Sword } from "lucide-react";
import BusinessSidebar from "@/components/BusinessSidebar";

type BusinessProfile = {
  id?: string;
  name: string;
  logo?: string | null;
  industry: string;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  bio?: string | null;
  email: string;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export default function BusinessProfile() {
  const { data: session } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessData, setBusinessData] = useState<BusinessProfile>({
    name: "",
    industry: "Technology",
    email: "",
    phone: null
  });
  const [logo, setLogo] = useState<string | null>("/default-profile.png");

  // Safe URL formatter with proper error handling
  const formatCloudinaryUrl = (url: string | null | undefined): string => {
    if (!url) return "/default-profile.png";
    if (typeof url !== 'string') return "/default-profile.png";
    if (!url.includes('cloudinary.com')) return url;
    if (!url.endsWith('.png') && !url.endsWith('.jpg') && !url.endsWith('.jpeg')) {
      return `${url}.png`;
    }
    return url;
  };

  // Fetch business profile data
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/business');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setBusinessData({
              name: data.name || "",
              industry: data.industry || "Technology",
              location: data.location || null,
              website: data.website || null,
              linkedin: data.linkedin || null,
              bio: data.bio || null,
              email: data.email || session.user.email || "",
              phone: data.phone || session?.user?.phone || null
            });
            setLogo(data.logo || "/default-profile.png");
          }
        }
      } catch (error) {
        console.error('Failed to fetch business profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [session]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ 
      ...prev, 
      [name]: value === "" ? null : value 
    }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { imageUrl } = await response.json();
    setLogo(imageUrl || "/default-profile.png");
  } catch (error) {
    console.error('Failed to upload logo:', error);
    // Show error to user
    alert('Logo upload failed. Please try again.');
    setLogo("/default-profile.png");
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...businessData,
            logo: logo
          })
      });

      if (response.ok) {
        setEditMode(false);
        const updatedData = await response.json();
        setBusinessData(prev => ({
          ...prev,
          ...updatedData
        }));
        if (updatedData.logo) {
          setLogo(updatedData.logo);
        }
      }
    } catch (error) {
      console.error('Failed to update business profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#FFF3E0' }}>
        <BusinessSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 animate-pulse shadow-lg"></div>
            <div className="h-4 w-48 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(216, 67, 21, 0.1)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF3E0' }}>
      <BusinessSidebar />
      
      <div className="flex-1 p-6 md:p-8">
        {/* Heroic Header */}
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{
                    background: 'linear-gradient(135deg, #D84315, #FF5722)',
                    boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)'
                  }}
                >
                  <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  <span 
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                    }}
                  >
                    Quest Giver Profile
                  </span>
                </h1>
              </div>
              <p className="text-orange-900/80">
                {editMode ? "Forge your legendary presence" : "Showcase your heroic brand"}
              </p>
            </div>
            {editMode ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(45deg, #D84315, #FF5722)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(216, 67, 21, 0.4)'
                }}
              >
                <FaSave className="w-4 h-4" /> 
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border font-medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  borderColor: 'rgba(216, 67, 21, 0.2)',
                  color: '#D84315'
                }}
              >
                <FaEdit className="w-4 h-4" /> 
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Modular Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="rounded-2xl overflow-hidden lg:col-span-2 transition-all hover:shadow-xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)',
                border: '1px solid rgba(216, 67, 21, 0.1)'
              }}
            >
              <div className="p-8">
                {/* Logo & Name Section */}
                <div className="flex items-center space-x-6 mb-10">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={formatCloudinaryUrl(logo)}
                        alt="Business Logo"
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-profile.png";
                        }}
                      />
                    </div>
                    {editMode && (
                      <label className="absolute -bottom-2 -right-2 p-3 rounded-full shadow-xl cursor-pointer"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(216, 67, 21, 0.2)'
                        }}
                      >
                        <FiUpload className="w-5 h-5" style={{ color: '#FF5722' }} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      <span 
                        className="text-transparent bg-clip-text"
                        style={{
                          backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                        }}
                      >
                        {businessData.name || "Your Guild"}
                      </span>
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(255, 87, 34, 0.1)',
                          color: '#D84315'
                        }}
                      >
                        <FaBuilding className="inline mr-1" />
                        {businessData.industry || "Industry"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#D84315' }}>
                      Guild Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={businessData.name}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 rounded-xl focus:outline-none transition-all"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(216, 67, 21, 0.2)',
                        }}
                        placeholder="Enter your guild name"
                      />
                    ) : (
                      <p className="font-medium text-lg" style={{ color: '#212121' }}>
                        {businessData.name || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: '#D84315' }}>
                        Guild Type
                      </label>
                      {editMode ? (
                        <div className="relative">
                          <select
                            name="industry"
                            value={businessData.industry}
                            onChange={handleInputChange}
                            className="w-full px-5 py-3 rounded-xl appearance-none pr-10"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              border: '1px solid rgba(216, 67, 21, 0.2)'
                            }}
                          >
                            <option value="Technology">Artisans</option>
                            <option value="FMCG">Merchants</option>
                            <option value="Education">Sages</option>
                            <option value="Healthcare">Healers</option>
                            <option value="Finance">Bankers</option>
                            <option value="Retail">Traders</option>
                            <option value="Other">Other</option>
                          </select>
                          <FaChevronDown className="absolute right-4 top-4 w-4 h-4 pointer-events-none" style={{ color: '#D84315' }} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: 'rgba(255, 87, 34, 0.1)',
                              color: '#D84315'
                            }}
                          >
                            {businessData.industry}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: '#D84315' }}>
                        Stronghold
                      </label>
                      {editMode ? (
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-4 top-4 w-4 h-4" style={{ color: '#D84315' }} />
                          <input
                            type="text"
                            name="location"
                            value={businessData.location || ""}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-5 py-3 rounded-xl"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              border: '1px solid rgba(216, 67, 21, 0.2)'
                            }}
                            placeholder="City, Kingdom"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" style={{ color: '#212121' }}>
                          <FaMapMarkerAlt className="w-4 h-4" style={{ color: '#D84315' }} />
                          <span>{businessData.location || "Not specified"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-1 items-center gap-2" style={{ color: '#D84315' }}>
                      <FaPalette style={{ color: '#FF5722' }} />
                      Guild Legend
                    </label>
                    {editMode ? (
                      <textarea
                        name="bio"
                        value={businessData.bio || ""}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-5 py-3 rounded-xl"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(216, 67, 21, 0.2)',
                        }}
                        placeholder="Tell your guild's legend..."
                      />
                    ) : (
                      <div className="p-5 rounded-xl" style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(216, 67, 21, 0.1)'
                      }}>
                        <p className="whitespace-pre-line" style={{ color: '#212121' }}>
                          {businessData.bio || "No guild legend yet. Forge your story to inspire heroes!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Contact Block */}
              <div className="rounded-2xl p-6 transition-all hover:shadow-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)',
                  border: '1px solid rgba(216, 67, 21, 0.1)'
                }}
              >
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-3" style={{ color: '#D84315' }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 87, 34, 0.1)', color: '#FF5722' }}>
                    <FaEnvelope className="w-5 h-5" />
                  </div>
                  Contact Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#D84315' }}>
                      Pigeon Post
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-4 w-4 h-4" style={{ color: '#D84315' }} />
                        <input
                          type="email"
                          name="email"
                          value={businessData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-5 py-3 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(216, 67, 21, 0.2)'
                          }}
                        />
                      </div>
                    ) : (
                      <a
                        href={`mailto:${businessData.email}`}
                        className="flex items-center gap-3 transition-colors group"
                        style={{ color: '#D84315' }}
                      >
                        <div className="p-2 rounded-lg group-hover:bg-orange-100 transition-colors"
                          style={{ backgroundColor: 'rgba(255, 87, 34, 0.1)' }}
                        >
                          <FaEnvelope className="w-5 h-5" style={{ color: '#FF5722' }} />
                        </div>
                        <span className="font-medium">{businessData.email}</span>
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#D84315' }}>
                      Horn Signal
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-4 w-4 h-4" style={{ color: '#D84315' }} />
                        <input
                          type="tel"
                          name="phone"
                          value={businessData.phone || ""}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-5 py-3 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(216, 67, 21, 0.2)'
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 ${businessData.phone ? "text-orange-900" : "text-orange-900/50"}`}>
                        <div className={`p-2 rounded-lg ${businessData.phone ? "bg-orange-100" : "bg-orange-100/50"}`}
                          style={{ backgroundColor: businessData.phone ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 87, 34, 0.05)' }}
                        >
                          <FaPhone className="w-5 h-5" style={{ color: '#FF5722' }} />
                        </div>
                        <span className="font-medium">
                          {businessData.phone || "Not specified"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links Block */}
              <div className="rounded-2xl p-6 transition-all hover:shadow-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)',
                  border: '1px solid rgba(216, 67, 21, 0.1)'
                }}
              >
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-3" style={{ color: '#D84315' }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 87, 34, 0.1)', color: '#FF5722' }}>
                    <FaGlobe className="w-5 h-5" />
                  </div>
                  Guild Connections
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#D84315' }}>
                      Scrolls (Website)
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <FaGlobe className="absolute left-4 top-4 w-4 h-4" style={{ color: '#D84315' }} />
                        <input
                          type="url"
                          name="website"
                          value={businessData.website || ""}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-5 py-3 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(216, 67, 21, 0.2)'
                          }}
                          placeholder="https://"
                        />
                      </div>
                    ) : (
                      <a
                        href={businessData.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 ${businessData.website ? "text-orange-900" : "text-orange-900/50"}`}
                      >
                        <div className={`p-2 rounded-lg ${businessData.website ? "bg-orange-100" : "bg-orange-100/50"}`}
                          style={{ backgroundColor: businessData.website ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 87, 34, 0.05)' }}
                        >
                          <FaGlobe className="w-5 h-5" style={{ color: '#FF5722' }} />
                        </div>
                        <span className="font-medium truncate">
                          {businessData.website ? businessData.website.replace(/^https?:\/\//, '') : "Not specified"}
                        </span>
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#D84315' }}>
                      Herald (LinkedIn)
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <FaLinkedin className="absolute left-4 top-4 w-4 h-4" style={{ color: '#D84315' }} />
                        <input
                          type="url"
                          name="linkedin"
                          value={businessData.linkedin || ""}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-5 py-3 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(216, 67, 21, 0.2)'
                          }}
                          placeholder="https://linkedin.com/company/"
                        />
                      </div>
                    ) : (
                      <a
                        href={businessData.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 ${businessData.linkedin ? "text-orange-900" : "text-orange-900/50"}`}
                      >
                        <div className={`p-2 rounded-lg ${businessData.linkedin ? "bg-orange-100" : "bg-orange-100/50"}`}
                          style={{ backgroundColor: businessData.linkedin ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 87, 34, 0.05)' }}
                        >
                          <FaLinkedin className="w-5 h-5" style={{ color: '#FF5722' }} />
                        </div>
                        <span className="font-medium">
                          {businessData.linkedin ? "LinkedIn Profile" : "Not specified"}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Heroic Tip */}
              {editMode && (
                <div className="rounded-2xl border p-6"
                  style={{
                    backgroundColor: 'rgba(255, 243, 224, 0.7)',
                    borderColor: 'rgba(216, 67, 21, 0.2)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl text-white shadow-md"
                      style={{
                        background: 'linear-gradient(45deg, #D84315, #FF5722)'
                      }}
                    >
                      <FaLightbulb className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: '#D84315' }}>Heroic Branding Tip</h4>
                      <p className="text-sm mt-2" style={{ color: '#D84315' }}>
                        A legendary crest and compelling guild story can attract 80% more heroes to your quests!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Badge */}
              <div className="rounded-2xl border p-5 text-center"
                style={{
                  backgroundColor: 'rgba(255, 243, 224, 0.7)',
                  borderColor: 'rgba(216, 67, 21, 0.2)'
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-md mb-3"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <FiAward className="w-6 h-6" style={{ color: '#FF5722' }} />
                </div>
                <h4 className="font-bold" style={{ color: '#D84315' }}>Legendary Guild Status</h4>
                <p className="text-sm mt-1" style={{ color: '#D84315' }}>
                  Complete all sections to earn your guild's legendary badge
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}