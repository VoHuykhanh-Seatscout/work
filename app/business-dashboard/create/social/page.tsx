"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "../../modal";
import BusinessSidebar from "@/components/BusinessSidebar";
import { MarkdownTextEditor } from "@/components/MarkdownTextEditor";
import { FileUpload } from "@/components/FileUpload";
import { MultiSelect } from "@/components/MultiSelect";
import { DatePicker } from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";

interface Speaker {
  name: string;
  title: string;
  bio: string;
  photo: File | string | null;
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  speaker: string;
}

interface FormData {
  eventName: string;
  tagline: string;
  organizerName: string;
  eventMode: string;
  location: string;
  onlineLink: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  description: string;
  coverImage: File | string | null;
  additionalMedia: File[];
  eventRules: {
    enabled: boolean;
    text: string;
  };
  maxCapacity: number | null;
  speakers: Speaker[];
  agenda: AgendaItem[];
  promotionalBanner: File | string | null;
  socialMediaLinks: string[];
  eventPoster: File | string | null;
  customRegistrationLink: string;
  emailNotifications: boolean;
  timezone: string;
}


export default function CreateSocialEvent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    eventName: "",
    tagline: "",
    organizerName: "",
    eventMode: "in-person",
    location: "",
    onlineLink: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: "18:00",
    endTime: "20:00",
    eventType: "networking",
    description: "",
    coverImage: null,
    additionalMedia: [],
    eventRules: {
      enabled: false,
      text: ""
    },
    maxCapacity: null,
    speakers: [],
    agenda: [],
    promotionalBanner: null,
    socialMediaLinks: [],
    eventPoster: null,
    customRegistrationLink: "",
    emailNotifications: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [showRules, setShowRules] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<FormData[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  const steps = [
    "Basic Info",
    "Event Details",
    "Guests & Schedule",
    "Promotion",
    "Preview & Publish"
  ];

  const eventModeOptions = [
    { value: "online", label: "Online" },
    { value: "in-person", label: "In-Person" },
    { value: "hybrid", label: "Hybrid" }
  ];

  const eventTypeOptions = [
    { value: "networking", label: "Networking" },
    { value: "talkshow", label: "Talkshow" },
    { value: "panel-discussion", label: "Panel Discussion" },
    { value: "team-building", label: "Team Building" },
    { value: "workshop", label: "Workshop" },
    { value: "conference", label: "Conference" },
    { value: "social", label: "Social Gathering" }
  ];

  const timezoneOptions = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Singapore"
  ];

  const socialMediaOptions = [
    "Twitter", "LinkedIn", "Facebook", "Instagram", "YouTube"
  ];

  const fileTypes = [
    { value: "pdf", label: "PDF" },
    { value: "ppt", label: "PowerPoint" },
    { value: "video", label: "Video" },
    { value: "image", label: "Image" }
  ];

  useEffect(() => {
    // Auto-fill organizer info
    const fetchOrganizerInfo = async () => {
      try {
        const response = await fetch('/api/business-profile');
        const organizerInfo = await response.json();
        
        setFormData(prev => ({
          ...prev,
          organizerName: organizerInfo.companyName || ''
        }));
      } catch (error) {
        console.error("Failed to fetch organizer info:", error);
      }
    };
    
    fetchOrganizerInfo();

    // Load saved drafts
    const loadDrafts = async () => {
      try {
        const response = await fetch('/api/event-drafts');
        const drafts = await response.json();
        setSavedDrafts(drafts);
      } catch (error) {
        console.error("Failed to load drafts:", error);
      }
    };
    
    loadDrafts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: keyof FormData, file: File | null) => {
    if ((name === 'coverImage' || name === 'promotionalBanner' || name === 'eventPoster') && file && !validateFile(file, 5, ['image'])) {
      setError('Image must be under 5MB');
      return;
    }
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleAdditionalMediaChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, additionalMedia: files }));
  };

  const handleSocialMediaChange = (selectedPlatforms: string[]) => {
    setFormData(prev => ({ ...prev, socialMediaLinks: selectedPlatforms }));
  };

  // Speaker handlers
  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string | File | null) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index] = {
      ...updatedSpeakers[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, speakers: updatedSpeakers }));
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { 
        name: "", 
        title: "", 
        bio: "", 
        photo: null 
      }]
    }));
  };

  const removeSpeaker = (index: number) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers.splice(index, 1);
    setFormData(prev => ({ ...prev, speakers: updatedSpeakers }));
  };

  // Agenda handlers
  const handleAgendaChange = (index: number, field: keyof AgendaItem, value: string) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda[index] = {
      ...updatedAgenda[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, agenda: updatedAgenda }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [
        ...prev.agenda,
        {
          time: "",
          title: "",
          description: "",
          speaker: ""
        }
      ]
    }));
  };

  const removeAgendaItem = (index: number) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda.splice(index, 1);
    setFormData(prev => ({ ...prev, agenda: updatedAgenda }));
  };

  // Rules toggle
  const toggleRules = () => {
    setShowRules(!showRules);
    if (!showRules) {
      setFormData(prev => ({
        ...prev,
        eventRules: { ...prev.eventRules, enabled: true }
      }));
    }
  };

  // Validation functions
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.eventName || !formData.organizerName || !formData.startDate || !formData.startTime) {
          setError('Please fill all required fields in Basic Info');
          return false;
        }
        if (formData.eventMode === "online" && !formData.onlineLink) {
          setError('Please provide a meeting link for online events');
          return false;
        }
        if ((formData.eventMode === "in-person" || formData.eventMode === "hybrid") && !formData.location) {
          setError('Please provide a location for in-person events');
          return false;
        }
        break;
      case 2:
        if (!formData.description) {
          setError('Please provide an event description');
          return false;
        }
        if (!formData.coverImage) {
          setError('Please upload a cover image');
          return false;
        }
        break;
      case 3:
        if (formData.eventType === "talkshow" || formData.eventType === "panel-discussion") {
          if (formData.speakers.length === 0) {
            setError('Please add at least one speaker for this event type');
            return false;
          }
        }
        break;
      case 4:
        if (!formData.promotionalBanner) {
          setError('Please upload a promotional banner');
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

  const saveAsDraft = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/event-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const data = await response.json();
      setSavedDrafts(prev => [...prev, data]);
      setShowSuccessModal(true);
    } catch (error) {
      setError('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadDraft = (draft: FormData) => {
    setFormData(draft);
    setShowDraftsModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
  
    setIsSubmitting(true);
    setError('');
  
    try {
      const formDataToSend = new FormData();
      
      // Append files
      if (formData.coverImage) formDataToSend.append('coverImage', formData.coverImage as Blob);
      if (formData.promotionalBanner) formDataToSend.append('promotionalBanner', formData.promotionalBanner as Blob);
      if (formData.eventPoster) formDataToSend.append('eventPoster', formData.eventPoster as Blob);
      
      // Append additional media
      formData.additionalMedia.forEach((file, index) => {
        formDataToSend.append(`additionalMedia_${index}`, file);
      });

      // Append speakers photos
      formData.speakers.forEach((speaker, index) => {
        if (speaker.photo) {
          formDataToSend.append(`speakerPhoto_${index}`, speaker.photo as Blob);
        }
      });

      // Append all other fields
      const { coverImage, promotionalBanner, eventPoster, additionalMedia, speakers, ...rest } = formData;
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(
            key, 
            typeof value === 'object' ? JSON.stringify(value) : value.toString()
          );
        }
      });

      const response = await fetch('/api/social', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      setError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. AI in Business Summit"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Future of AI in Business"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Organizer Name *</label>
                <input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Event Mode *</label>
                <div className="grid grid-cols-3 gap-4">
                  {eventModeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="eventMode"
                        value={option.value}
                        checked={formData.eventMode === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {formData.eventMode === "online" && (
                <div>
                  <label className="block text-gray-700 mb-1">Online Meeting Link *</label>
                  <input
                    type="url"
                    name="onlineLink"
                    value={formData.onlineLink}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
              
              {(formData.eventMode === "in-person" || formData.eventMode === "hybrid") && (
                <div>
                  <label className="block text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter venue name or address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Start typing to see suggested venues</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Start Date *</label>
                  <DatePicker
                    value={formData.startDate}
                    onChange={(date: string) => setFormData(prev => ({ ...prev, startDate: date }))}
                    minDate={new Date().toISOString().split('T')[0]}
                    maxDate="2030-12-31"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    value={formData.endDate}
                    onChange={(date: string) => setFormData(prev => ({ ...prev, endDate: date }))}
                    minDate={formData.startDate}
                    maxDate="2030-12-31"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Start Time *</label>
                  <TimePicker
                    value={formData.startTime}
                    onChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">End Time</label>
                  <TimePicker
                    value={formData.endTime}
                    onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {eventTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {(formData.eventMode === "online" || formData.eventMode === "hybrid") && (
                <div>
                  <label className="block text-gray-700 mb-1">Timezone *</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezoneOptions.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1">Description *</label>
                <MarkdownTextEditor
                  value={formData.description}
                  onChange={(content: string) => setFormData(prev => ({...prev, description: content}))}
                  placeholder="Enter detailed event description..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Cover Image *</label>
                <FileUpload
                  name="coverImage"
                  onChange={(file: File | null) => handleFileChange('coverImage', file)}
                  accept="image/*"
                  preview={formData.coverImage}
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
              </div>
              
              <div>
  <label className="block text-gray-700 mb-1">Additional Media</label>
  <FileUpload
  name="additionalMedia" // Add this required prop
  onChange={(file: File | null) => {
    if (file) {
      handleAdditionalMediaChange([...(formData.additionalMedia || []), file]);
    }
  }}
  accept=".pdf,.ppt,.pptx,.mp4,.mov,.jpg,.jpeg,.png"
  preview={formData.additionalMedia?.[0]} // Show first file as preview
  maxSize={10}
/>
  <p className="text-xs text-gray-500 mt-1">Upload PDFs, presentations, or videos (max 10MB each)</p>
  
  {/* Display all uploaded files */}
  {formData.additionalMedia?.length > 0 && (
    <div className="mt-2 space-y-2">
      {formData.additionalMedia.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-md">
              <FileIcon type={file.type} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const updatedFiles = [...formData.additionalMedia];
              updatedFiles.splice(index, 1);
              handleAdditionalMediaChange(updatedFiles);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
              
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.eventRules.enabled}
                      onChange={toggleRules}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Add Event Rules</span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleRules}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showRules ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showRules && (
                  <div className="mt-3">
                    <textarea
                      name="eventRules"
                      value={formData.eventRules.text}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventRules: { ...prev.eventRules, text: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Enter event rules or guidelines..."
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Maximum Capacity (optional)</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    maxCapacity: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  min="1"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Guests & Schedule</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1">Guest Speakers</label>
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Name</label>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Speaker name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Title</label>
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => handleSpeakerChange(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Speaker title"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Bio</label>
                      <textarea
                        value={speaker.bio}
                        onChange={(e) => handleSpeakerChange(index, 'bio', e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={2}
                        placeholder="Speaker bio"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Photo</label>
                      <FileUpload
                        name={`speakerPhoto_${index}`}
                        onChange={(file: File | null) => handleSpeakerChange(index, 'photo', file)}
                        accept="image/*"
                        preview={speaker.photo}
                        maxSize={2}
                        circularPreview
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove Speaker
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpeaker}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  + Add Speaker
                </button>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Agenda/Schedule</label>
                {formData.agenda.map((item, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Time</label>
                        <TimePicker
                          value={item.time}
                          onChange={(time) => handleAgendaChange(index, 'time', time)}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700 text-sm mb-1">Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Session title"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleAgendaChange(index, 'description', e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={2}
                        placeholder="Session details"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Speaker</label>
                      <select
                        value={item.speaker}
                        onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Speaker</option>
                        {formData.speakers.map((speaker, idx) => (
                          <option key={idx} value={speaker.name}>{speaker.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove Agenda Item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAgendaItem}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  + Add Agenda Item
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Promotion</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1">Promotional Banner *</label>
                <FileUpload
                  name="promotionalBanner"
                  onChange={(file: File | null) => handleFileChange('promotionalBanner', file)}
                  accept="image/*"
                  preview={formData.promotionalBanner}
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Social Media Links</label>
                <MultiSelect
                  options={socialMediaOptions}
                  selected={formData.socialMediaLinks}
                  onChange={handleSocialMediaChange}
                  placeholder="Select platforms to promote on..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Event Poster (Optional)</label>
                <FileUpload
                  name="eventPoster"
                  onChange={(file: File | null) => handleFileChange('eventPoster', file)}
                  accept="image/*"
                  preview={formData.eventPoster}
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-1">Downloadable poster for sharing</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Custom Registration Link (Optional)</label>
                <input
                  type="url"
                  name="customRegistrationLink"
                  value={formData.customRegistrationLink}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-3">Notification Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Send email notifications to registered users</span>
                  </label>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-3">QR Code Generator</h3>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                    QR Code
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Generate a QR code that links directly to your event registration page.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Generate QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Preview & Publish</h2>
            <div className="flex justify-end mb-4">
              <div className="flex border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 py-1 text-sm ${previewMode === "desktop" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-3 py-1 text-sm ${previewMode === "mobile" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                >
                  Mobile
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg overflow-hidden ${previewMode === "mobile" ? "max-w-md mx-auto" : ""}`}>
              <div className="p-6 bg-gray-50">
                {formData.coverImage && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={typeof formData.coverImage === 'string' ? formData.coverImage : URL.createObjectURL(formData.coverImage)} 
                      alt="Event cover" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{formData.eventName}</h3>
                    <p className="text-gray-600">{formData.organizerName}</p>
                    {formData.tagline && (
                      <p className="text-gray-700 mt-1 italic">"{formData.tagline}"</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Date</div>
                    <div>
                      {new Date(formData.startDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {formData.endDate && formData.endDate !== formData.startDate && (
                        <> - {new Date(formData.endDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Time</div>
                    <div>
                      {formData.startTime} - {formData.endTime}
                      {(formData.eventMode === "online" || formData.eventMode === "hybrid") && (
                        <div className="text-xs text-gray-500">({formData.timezone})</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.eventMode === "online" && (
                  <div className="mb-4 p-3 bg-white rounded shadow">
                    <div className="text-sm text-gray-500">Location</div>
                    <div>Online Event</div>
                    <a href={formData.onlineLink} className="text-blue-600 text-sm break-all">{formData.onlineLink}</a>
                  </div>
                )}
                                {formData.eventMode === "in-person" && (
                  <div className="mb-4 p-3 bg-white rounded shadow">
                    <div className="text-sm text-gray-500">Location</div>
                    <div>{formData.location}</div>
                  </div>
                )}
                
                {formData.eventMode === "hybrid" && (
                  <div className="mb-4 p-3 bg-white rounded shadow">
                    <div className="text-sm text-gray-500">Location</div>
                    <div>Hybrid Event</div>
                    <div className="mt-1">{formData.location}</div>
                    <div className="mt-1">
                      Online: <a href={formData.onlineLink} className="text-blue-600 text-sm break-all">{formData.onlineLink}</a>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">About this event</h4>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>
                
                {formData.eventRules.enabled && formData.eventRules.text && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium mb-2 text-yellow-800">Event Rules</h4>
                    <p className="whitespace-pre-line">{formData.eventRules.text}</p>
                  </div>
                )}
                
                {formData.speakers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Speakers</h4>
                    <div className="space-y-4">
                      {formData.speakers.map((speaker, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {speaker.photo && (
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img 
                                src={typeof speaker.photo === 'string' ? speaker.photo : URL.createObjectURL(speaker.photo)} 
                                alt={speaker.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{speaker.name}</div>
                            <div className="text-sm text-gray-600">{speaker.title}</div>
                            <div className="text-sm mt-1">{speaker.bio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.agenda.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Agenda</h4>
                    <div className="space-y-3">
                      {formData.agenda.map((item, index) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                          <div className="font-medium">{item.time} - {item.title}</div>
                          {item.speaker && <div className="text-sm text-gray-600">Speaker: {item.speaker}</div>}
                          {item.description && <div className="text-sm mt-1">{item.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-white rounded-lg shadow">
                  <h4 className="font-medium mb-3">Registration Details</h4>
                  <div className="space-y-3">
                    {formData.maxCapacity && (
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium">{formData.maxCapacity} attendees</span>
                      </div>
                    )}
                    {formData.customRegistrationLink && (
                      <div className="flex justify-between">
                        <span>Registration Link:</span>
                        <a href={formData.customRegistrationLink} className="font-medium text-blue-600 break-all">
                          {formData.customRegistrationLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Ready to publish?</h4>
              <p className="text-blue-700 mb-4">
                Review all the information above carefully. Once published, your event will be visible to attendees 
                based on your visibility settings.
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="confirmPublish"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="confirmPublish" className="text-sm text-blue-800">
                  I confirm all event details are correct and ready to publish
                </label>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={saveAsDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const validateFile = (file: File, maxSizeMB: number, allowedTypes: string[]): boolean => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return false;
    }
    
    if (allowedTypes.includes('image') && !file.type.startsWith('image/')) {
      return false;
    }
    
    return true;
  };

  const FileIcon = ({ type }: { type: string }) => {
    if (type.startsWith("image/")) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };
  
  const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  // Post-creation dashboard component
  const EventDashboard = ({ eventId }: { eventId: string }) => {
    const [eventData, setEventData] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('analytics');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<FormData>>({});
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
      const fetchEventData = async () => {
        try {
          const response = await fetch(`/api/events/${eventId}`);
          const data = await response.json();
          setEventData(data);
          setEditFormData(data);
        } catch (error) {
          console.error("Failed to fetch event data:", error);
        }
      };

      const fetchAttendees = async () => {
        try {
          const response = await fetch(`/api/events/${eventId}/attendees`);
          const data = await response.json();
          setAttendees(data);
        } catch (error) {
          console.error("Failed to fetch attendees:", error);
        }
      };

      fetchEventData();
      fetchAttendees();
    }, [eventId]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveChanges = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData),
        });

        if (!response.ok) {
          throw new Error('Failed to update event');
        }

        const data = await response.json();
        setEventData(data);
        setEditFormData(data);
        setIsEditing(false);
        setUpdateMessage('Event updated successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      } catch (error) {
        console.error("Failed to update event:", error);
        setUpdateMessage('Failed to update event. Please try again.');
      }
    };

    const sendUpdateToAttendees = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'There has been an update to the event details.'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send updates');
        }

        setUpdateMessage('Update sent to attendees successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      } catch (error) {
        console.error("Failed to send updates:", error);
        setUpdateMessage('Failed to send updates. Please try again.');
      }
    };

    const downloadAttendeeList = () => {
      const csvContent = [
        ['Name', 'Email', 'Registration Date'],
        ...attendees.map(attendee => [
          attendee.name,
          attendee.email,
          new Date(attendee.registrationDate).toLocaleString()
        ])
      ].map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendees_${eventId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!eventData) {
      return <div className="p-8 text-center">Loading event data...</div>;
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{eventData.eventName}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Event'}
            </button>
            {isEditing && (
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {updateMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            updateMessage.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {updateMessage}
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('attendees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendees
            </button>
            <button
              onClick={() => setActiveTab('promotion')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'promotion'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Promotion
            </button>
          </nav>
        </div>

        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Event Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-500">Total Views</div>
                <div className="text-2xl font-bold">1,245</div>
                <div className="text-sm text-green-600">+12% from last week</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-500">Registrations</div>
                <div className="text-2xl font-bold">{attendees.length}</div>
                <div className="text-sm text-green-600">
                  {eventData.maxCapacity ? `${Math.round((attendees.length / eventData.maxCapacity) * 100)}% of capacity` : 'Unlimited capacity'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="text-sm text-gray-500">Engagement Rate</div>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-sm text-green-600">+8% from average</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border mb-6">
              <h4 className="font-medium mb-3">Registration Timeline</h4>
              <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                Registration chart placeholder
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Attendee Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={downloadAttendeeList}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Download List
                </button>
                <button
                  onClick={sendUpdateToAttendees}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Update
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {attendee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(attendee.registrationDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendee.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : attendee.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {attendee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {attendee.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                            <button className="text-red-600 hover:text-red-900">Decline</button>
                          </>
                        )}
                        {attendee.status === 'confirmed' && (
                          <button className="text-red-600 hover:text-red-900">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'promotion' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Promotion Tools</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border">
                <h4 className="font-medium mb-3">Social Sharing</h4>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-500 text-white rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 bg-blue-400 text-white rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  <button className="p-2 bg-blue-600 text-white rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 bg-red-600 text-white rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border">
                <h4 className="font-medium mb-3">QR Code</h4>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                    QR Code
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2">
                      Download PNG
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      Download SVG
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <h4 className="font-medium mb-3">Email Campaign</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Join us for [Event Name]!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Write your email content here..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Send Test Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <BusinessSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Create New Social Event</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDraftsModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                View Drafts
              </button>
              <button
                onClick={() => router.push('/business-dashboard/create')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${index < currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center text-sm ${index + 1 <= currentStep ? 'font-medium text-blue-600' : 'text-gray-500'}`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Content */}
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/business/events');
        }}
      >
        <div className="text-center py-4">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="mt-2 text-xl font-semibold">Event Created Successfully!</h2>
          <p className="mt-2 text-gray-600">
            Your event has been published and is now visible to attendees.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/business/events');
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200"
            >
              Back to Events
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Drafts Modal */}
      <Modal
        isOpen={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
        title="Saved Drafts"
      >
        <div className="py-4">
          {savedDrafts.length === 0 ? (
            <p className="text-center text-gray-500">No saved drafts found.</p>
          ) : (
            <div className="space-y-2">
              {savedDrafts.map((draft, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadDraft(draft)}
                >
                  <div className="font-medium">{draft.eventName || 'Untitled Event'}</div>
                  <div className="text-sm text-gray-500">
                    Last saved: {new Date().toLocaleString()} {/* In a real app, use actual saved date */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}