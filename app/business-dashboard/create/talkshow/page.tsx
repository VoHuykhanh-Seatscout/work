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
  title: string;
  organizerName: string;
  organizerLogo: File | string | null;
  date: string;
  time: string;
  duration: string;
  locationType: string;
  meetingLink: string;
  venueAddress: string;
  speakers: Speaker[];
  thumbnail: File | string | null;
  description: string;
  agenda: AgendaItem[];
  tags: string[];
  audienceType: string;
  enableQandA: boolean;
  enablePolls: boolean;
  allowReactions: boolean;
  registrationType: string;
  ticketingType: string;
  ticketPrice: number;
  maxAttendees: number;
  registrationDeadline: string;
  confirmationEmailTemplate: string;
  visibility: string;
  sendReminders: boolean;
  paymentQrCode: File | string | null;
}

export default function CreateTalkshow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    organizerName: "",
    organizerLogo: null,
    date: "",
    time: "",
    duration: "60",
    locationType: "online",
    meetingLink: "",
    venueAddress: "",
    speakers: [],
    thumbnail: null,
    description: "",
    agenda: [],
    tags: [],
    audienceType: "public",
    enableQandA: true,
    enablePolls: false,
    allowReactions: true,
    registrationType: "open",
    ticketingType: "free",
    ticketPrice: 0,
    maxAttendees: 100,
    registrationDeadline: "",
    confirmationEmailTemplate: "Thank you for registering for our talkshow!\n\nEvent Details:\nTitle: {title}\nDate: {date}\nTime: {time}\n\nJoin us at: {joinLink}",
    visibility: "public",
    sendReminders: true,
    paymentQrCode: null,
    
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");

  const steps = [
    "Basic Info",
    "Event Details",
    "Registration & Access",
    "Preview & Publish"
  ];

  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" }
  ];

  const locationTypeOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "In-person" },
    { value: "hybrid", label: "Hybrid" }
  ];

  const tagOptions = [
    "Technology", "Business", "Design", "Science", "Arts",
    "Career", "Leadership", "Innovation", "Startups", "Other"
  ];

  const audienceTypeOptions = [
    { value: "public", label: "Public" },
    { value: "invite", label: "Invite-only" },
    { value: "private", label: "Private" }
  ];

  const registrationTypeOptions = [
    { value: "open", label: "Open Registration" },
    { value: "approval", label: "Approval Required" },
    { value: "invite", label: "Invite Only" }
  ];

  const ticketingTypeOptions = [
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
    { value: "donation", label: "Donation-based" }
  ];

  const socialMediaOptions = [
    "Twitter", "LinkedIn", "Facebook", "Instagram", "YouTube"
  ];

  useEffect(() => {
    // Auto-fill organizer info
    const shouldAutoFill = !formData.organizerName;
    
    if (shouldAutoFill) {
      const fetchOrganizerInfo = async () => {
        try {
          const response = await fetch('/api/business-profile');
          const organizerInfo = await response.json();
          
          setFormData(prev => ({
            ...prev,
            organizerName: organizerInfo.companyName || '',
            organizerLogo: organizerInfo.logo || null
          }));
        } catch (error) {
          console.error("Failed to fetch organizer info:", error);
        }
      };
      
      fetchOrganizerInfo();
    }
  }, []);

  useEffect(() => {
  if (formData.date && formData.time) {
    setFormData(prev => ({
      ...prev,
      registrationDeadline: `${formData.date}T${formData.time}`
    }));
  }
}, [formData.date, formData.time]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (name: keyof FormData, file: File | null) => {
  if (!file) return;

  // Client-side validation
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeMB = 5;
  
  if (!validTypes.includes(file.type)) {
    setError('Only JPG, PNG, GIF, or WebP images are allowed');
    return;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    setError(`File size exceeds ${maxSizeMB}MB limit`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

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
    setError(`Failed to upload ${name}. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
  const handleTagChange = (selectedTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: selectedTags }));
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

  // Validation functions
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.title || !formData.organizerName || !formData.date || !formData.time) {
          setError('Please fill all required fields in Basic Info');
          return false;
        }
        if (formData.locationType === "online" && !formData.meetingLink) {
          setError('Please provide a meeting link for online events');
          return false;
        }
        if (formData.locationType === "offline" && !formData.venueAddress) {
          setError('Please provide a venue address for in-person events');
          return false;
        }
        break;
      case 2:
        if (!formData.description) {
          setError('Please provide an event description');
          return false;
        }
        break;
      case 3:
  if (formData.ticketingType === "paid") {
    if (formData.ticketPrice <= 0) {
      setError('Please set a valid ticket price for paid events');
      return false;
    }
    if (!formData.paymentQrCode) {
      setError('Please upload a payment QR code for paid events');
      return false;
    }
  }
  if (!formData.registrationDeadline) {
    setError('Please set a registration deadline');
    return false;
  }
  if (!formData.maxAttendees || formData.maxAttendees <= 0) { // Add this validation
    setError('Please set a valid number for max attendees');
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

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateCurrentStep()) return;

  setIsSubmitting(true);
  setError('');

  try {
    // Prepare the data to send
    const data = {
      title: formData.title,
      organizerName: formData.organizerName,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      locationType: formData.locationType,
      meetingLink: formData.meetingLink,
      venueAddress: formData.venueAddress,
      description: formData.description,
      audienceType: formData.audienceType,
      enableQandA: formData.enableQandA,
      enablePolls: formData.enablePolls,
      allowReactions: formData.allowReactions,
      registrationType: formData.registrationType,
      ticketingType: formData.ticketingType,
      ticketPrice: formData.ticketPrice,
      maxAttendees: formData.maxAttendees,
      registrationDeadline: formData.registrationDeadline,
      confirmationEmailTemplate: formData.confirmationEmailTemplate,
      visibility: formData.visibility,
      sendReminders: formData.sendReminders,
      thumbnail: typeof formData.thumbnail === 'string' ? formData.thumbnail : '',
      organizerLogo: typeof formData.organizerLogo === 'string' ? formData.organizerLogo : '',
      paymentQrCode: typeof formData.paymentQrCode === 'string' ? formData.paymentQrCode : '',
      speakers: formData.speakers,
      agenda: formData.agenda,
      tags: formData.tags,
      isPublished: true // or false based on your logic
    };

    const response = await fetch('/api/talkshows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to create talkshow');
    }

    const result = await response.json();
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Submission error:", error);
    setError(
      error instanceof Error 
        ? error.message 
        : 'Failed to create talkshow. Please try again.'
    );
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
                <label className="block text-gray-700 mb-1">Talkshow Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. The Future of AI in Business"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-gray-700 mb-1">Organizer Logo</label>
                  <FileUpload
                    name="organizerLogo"
                    onChange={(file: File | null) => handleFileChange('organizerLogo', file)}
                    accept="image/*"
                    maxSize={5}
                    circularPreview
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Date *</label>
                  <DatePicker
                    value={formData.date}
                    onChange={(date: string) => setFormData(prev => ({ ...prev, date }))}
                    minDate={new Date().toISOString().split('T')[0]} // today's date
                    maxDate="2030-12-31" // some future date
                    />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Time *</label>
                  <TimePicker
                    value={formData.time}
                    onChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Duration *</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Location Type *</label>
                <div className="grid grid-cols-3 gap-4">
                  {locationTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="locationType"
                        value={option.value}
                        checked={formData.locationType === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {formData.locationType === "online" && (
                <div>
                  <label className="block text-gray-700 mb-1">Meeting Link *</label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
              
              {formData.locationType === "offline" && (
                <div>
                  <label className="block text-gray-700 mb-1">Venue Address *</label>
                  <textarea
                    name="venueAddress"
                    value={formData.venueAddress}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter full address including city and country"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 mb-1">Speakers</label>
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
  onChange={async (file: File | null) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { imageUrl } = await response.json();
      handleSpeakerChange(index, 'photo', imageUrl);
    } catch (error) {
      console.error("Failed to upload speaker photo:", error);
      setError(`Failed to upload speaker photo. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  }}
  accept="image/*"
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
                <label className="block text-gray-700 mb-1">Event Thumbnail</label>
                <FileUpload
                  name="thumbnail"
                  onChange={(file: File | null) => handleFileChange('thumbnail', file)}
                  accept="image/*"
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
              </div>
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
                <label className="block text-gray-700 mb-1">Agenda</label>
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
              
              <div>
                <label className="block text-gray-700 mb-1">Tags & Categories</label>
                <MultiSelect
                  options={tagOptions}
                  selected={formData.tags}
                  onChange={handleTagChange}
                  placeholder="Select tags..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Audience Type *</label>
                <div className="grid grid-cols-3 gap-4">
                  {audienceTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="audienceType"
                        value={option.value}
                        checked={formData.audienceType === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-3">Engagement Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="enableQandA"
                      checked={formData.enableQandA}
                      onChange={(e) => setFormData(prev => ({ ...prev, enableQandA: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Live Q&A</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="enablePolls"
                      checked={formData.enablePolls}
                      onChange={(e) => setFormData(prev => ({ ...prev, enablePolls: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Polls</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="allowReactions"
                      checked={formData.allowReactions}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowReactions: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Allow Reactions (likes, claps, emojis)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Registration & Access</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-1">Registration Type *</label>
                <div className="grid grid-cols-3 gap-4">
                  {registrationTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="registrationType"
                        value={option.value}
                        checked={formData.registrationType === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Ticketing Options *</label>
                <div className="grid grid-cols-3 gap-4">
                  {ticketingTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="ticketingType"
                        value={option.value}
                        checked={formData.ticketingType === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {formData.ticketingType === "paid" && (
                <div>
                  <label className="block text-gray-700 mb-1">Ticket Price *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="pl-7 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <label className="block text-gray-700 mb-1">Payment QR Code *</label>
    <FileUpload
      name="paymentQrCode"
      onChange={(file: File | null) => handleFileChange('paymentQrCode', file)}
      accept="image/*"
      maxSize={2}
    />
    <p className="text-xs text-gray-500 mt-1">
      Upload a QR code that attendees can scan to make payments
    </p>
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 mb-1">Max Attendees *</label>
<input
  type="number"
  name="maxAttendees"
  value={formData.maxAttendees}
  onChange={handleChange}
  min="1"
  required
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-gray-700 mb-1">Registration Deadline Date *</label>
    <DatePicker
      value={formData.registrationDeadline.split('T')[0]}
      onChange={(date: string) => {
        // Get existing time or default to 23:59
        const timePart = formData.registrationDeadline.includes('T') 
          ? formData.registrationDeadline.split('T')[1] 
          : '23:59';
        
        // Combine with new date
        setFormData(prev => ({ 
          ...prev, 
          registrationDeadline: `${date}T${timePart}`
        }));
      }}
      minDate={new Date().toISOString().split('T')[0]}
      maxDate="2030-12-31"
    />
  </div>
  <div>
    <label className="block text-gray-700 mb-1">Time</label>
    <TimePicker
      value={formData.registrationDeadline.includes('T') 
        ? formData.registrationDeadline.split('T')[1] 
        : '23:59'}
      onChange={(time) => {
        // Get existing date or default to today
        const datePart = formData.registrationDeadline.split('T')[0] || 
          new Date().toISOString().split('T')[0];
        
        setFormData(prev => ({ 
          ...prev, 
          registrationDeadline: `${datePart}T${time}`
        }));
      }}
    />
  </div>
</div>
</div>
              
              <div>
                <label className="block text-gray-700 mb-1">Confirmation Email Template</label>
                <textarea
                  name="confirmationEmailTemplate"
                  value={formData.confirmationEmailTemplate}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {"{title}, {date}, {time}, {joinLink}, {organizer}"}
                </p>
              </div>
            </div>
          </div>
        );
      case 4:
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{formData.title}</h3>
                    <p className="text-gray-600">{formData.organizerName}</p>
                  </div>
                  {formData.thumbnail && (
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img 
                        src={typeof formData.thumbnail === 'string' ? formData.thumbnail : URL.createObjectURL(formData.thumbnail)} 
                        alt="Event thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Date</div>
                    <div>{formData.date}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Time</div>
                    <div>{formData.time}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div>{durationOptions.find(d => d.value === formData.duration)?.label}</div>
                  </div>
                </div>
                
                {formData.locationType === "online" && (
                  <div className="mb-4 p-3 bg-white rounded shadow">
                    <div className="text-sm text-gray-500">Location</div>
                    <div>Online: {formData.meetingLink}</div>
                  </div>
                )}
                
                {formData.locationType === "offline" && (
                  <div className="mb-4 p-3 bg-white rounded shadow">
                  <div className="text-sm text-gray-500">Location</div>
                  <div>{formData.venueAddress}</div>
                </div>
              )}
              
              {formData.locationType === "hybrid" && (
                <div className="mb-4 p-3 bg-white rounded shadow">
                  <div className="text-sm text-gray-500">Location</div>
                  <div>Hybrid: {formData.venueAddress}</div>
                  <div className="mt-1">Online: {formData.meetingLink}</div>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">About this event</h4>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.description }} />
              </div>
              
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
                <h4 className="font-medium mb-3">Registration</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Registration Type:</span>
                    <span className="font-medium">
                      {registrationTypeOptions.find(r => r.value === formData.registrationType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticketing:</span>
                    <span className="font-medium">
                      {ticketingTypeOptions.find(t => t.value === formData.ticketingType)?.label}
                      {formData.ticketingType === "paid" && ` ($${formData.ticketPrice})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Attendees:</span>
                    <span className="font-medium">{formData.maxAttendees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registration Deadline:</span>
                    <span className="font-medium">{formData.registrationDeadline}</span>
                  </div>
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmPublish"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="confirmPublish" className="text-sm text-blue-800">
                I confirm all event details are correct and ready to publish
              </label>
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

return (
  <div className="flex min-h-screen bg-gray-100">
    <BusinessSidebar />
    
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create New Talkshow</h1>
          <button
            onClick={() => router.push('/business-dashboard/create')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
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
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Talkshow'}
            </button>
          )}
        </div>
      </div>
    </div>
    
    {/* Success Modal */}
    <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/business/talkshows');
        }}
      >
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold mb-2">Talkshow Created Successfully!</h2>
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
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Your talkshow has been published successfully!
        </h3>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setShowSuccessModal(false);
              router.push('/business/talkshows');
            }}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            Back to Talkshows
          </button>
        </div>
      </div>
      </div>
    </Modal>
  </div>
);
}
