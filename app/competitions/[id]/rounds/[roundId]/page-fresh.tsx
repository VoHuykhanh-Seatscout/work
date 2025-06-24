import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { 
  FiCalendar, FiAward, FiBook, FiClock, FiUsers, 
  FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, 
  FiLayers, FiGrid, FiBox, FiArrowLeft, FiEdit3, 
  FiPieChart, FiTool, FiImage, FiCode, FiVideo
} from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SubmitWorkForm from '@/components/SubmitWorkForm';
import Navbar from '@/components/Navbar';
import Link from 'next/link';


type Params = {
  id: string;
  roundId: string;
};

interface ResourceItem {
  id: string;
  name: string;
  url: string;
  type?: string | null;
  size?: number | null;
}

interface SubmissionRules {
  allowFileUpload: boolean;
  allowExternalLinks: boolean;
  acceptLateSubmissions: boolean;
  showCountdown: boolean;
  maxFileSizeMB?: number;
  allowedFileTypes?: string[];
}

interface RoundDetails {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: 'draft' | 'live' | 'completed';
  deliverables: string | null;
  judgingMethod: string | null;
  criteria: Record<string, number>;
  submissionRules: SubmissionRules | null;
  resources: ResourceItem[];
  competition: {
    id: string;
    title: string;
    isRegistered: boolean;
  };
  submissions: {
    id: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback: string | null;
  }[];
}

interface PageProps {
  params: Promise<{
    id: string;
    roundId: string;
  }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

const RoundDetailsPage = async ({ params }: PageProps) => {
  // Resolve the params promise
  const { id, roundId } = await params;

  const cookieStore = cookies();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  let round: RoundDetails;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/rounds/${roundId}?includeResources=true`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieStore.toString()
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        url: response.url,
        error: errorData,
      });
      
      if (response.status === 401) {
        return redirect('/auth/signin');
      }
      
      return notFound();
    }

    round = await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return notFound();
  }

  const currentDate = new Date();
  const isActive = currentDate >= new Date(round.startDate) && currentDate <= new Date(round.endDate);
  const isPast = currentDate > new Date(round.endDate);
  const isFuture = currentDate < new Date(round.startDate);
  const hasSubmission = round.submissions.length > 0;
  const latestSubmission = hasSubmission ? round.submissions[0] : null;

  const formatDate = (dateString: string) => format(new Date(dateString), 'MMM d, yyyy h:mm a');
  const timeLeft = formatDistanceToNow(new Date(round.endDate), { addSuffix: true });

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Apple-inspired minimalist breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <Link 
                    href={`/competitions/${id}`} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                  >
                    <FiArrowLeft className="mr-1.5 h-4 w-4" />
                    Competition
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-700">{round.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Hero Section with Adobe-inspired gradient and Lego-like blocks */}
        <div className="mb-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          {/* Lego-inspired floating blocks */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-3xl bg-blue-500/10 transform rotate-12"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-2xl bg-indigo-400/20 transform -rotate-6"></div>
          <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-lg bg-white/10 transform rotate-45"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <FiLayers className="text-white" size={20} />
              </div>
              <span className="font-medium text-white/90 tracking-wide">{round.competition.title}</span>
            </div>
            
            {/* Apple-inspired typography */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter leading-tight">
              {round.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 ${
                round.status === 'live' ? 'bg-emerald-500/20' : 
                round.status === 'completed' ? 'bg-gray-800/30' : 'bg-amber-500/20'
              }`}>
                {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
              </span>

              <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <FiCalendar className="text-white/80" />
                <span>{formatDate(round.startDate)} → {formatDate(round.endDate)}</span>
              </div>

              {isActive && (
                <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <FiClock />
                  <span>{timeLeft}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Creative Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creative Brief with Adobe CC app-like styling */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-4 text-gray-800">
                  <div className="bg-blue-100 p-3 rounded-xl shadow-inner">
                    <FiEdit3 className="text-blue-600" size={24} />
                  </div>
                  <span>Creative Brief</span>
                </h2>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                  CREATOR TASK
                </div>
              </div>
              <div className="prose max-w-none text-gray-700">
                {round.description ? (
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed text-gray-800">{round.description}</p>
                    {/* Creator tips section */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <FiTool className="text-blue-600" />
                        Creator Tip
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Start by brainstorming multiple concepts before settling on your final approach. 
                        Adobe Creative Cloud offers great tools for moodboarding.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No description provided.</p>
                )}
              </div>
            </section>

            {/* Project Requirements with Lego-like modular blocks */}
            <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-4 text-gray-800">
                  <div className="bg-yellow-100 p-3 rounded-xl shadow-inner">
                    <FiBox className="text-yellow-600" size={24} />
                  </div>
                  <span>Project Requirements</span>
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {round.deliverables ? (
                    <div className="space-y-6">
                      {round.deliverables.split('\n').map((paragraph, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="bg-gray-100 p-1.5 rounded-lg mt-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <p className="text-lg leading-relaxed text-gray-800">{paragraph}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No specific deliverables provided.</p>
                  )}
                </div>
              </div>
              
              {round.resources && round.resources.length > 0 ? (
  <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
    <h3 className="font-medium mb-4 text-gray-700 text-lg flex items-center gap-2">
      <FiPieChart className="text-gray-500" />
      Resources & Assets ({round.resources.length})
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {round.resources.map((resource) => {
        if (!resource.url) {
          console.warn('Resource missing URL:', resource);
          return null;
        }

        // Extract file extension from URL
        const fileExtension = resource.url.split('.').pop()?.toLowerCase() || '';
        const fileName = resource.name || resource.url.split('/').pop() || 'Untitled';

        // Determine icon based on file type
        let icon;
        switch(fileExtension) {
          case 'pdf':
            icon = <FiFileText className="text-red-600" size={20} />;
            break;
          case 'psd':
          case 'ai':
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'svg':
            icon = <FiImage className="text-purple-600" size={20} />;
            break;
          case 'zip':
          case 'rar':
            icon = <FiLayers className="text-orange-600" size={20} />;
            break;
          case 'mov':
          case 'mp4':
          case 'avi':
            icon = <FiVideo className="text-red-600" size={20} />;
            break;
          case 'json':
          case 'js':
          case 'ts':
          case 'html':
          case 'css':
            icon = <FiCode className="text-blue-600" size={20} />;
            break;
          default:
            icon = <FiFileText className="text-gray-600" size={20} />;
        }

        // Format file size if available
        const formattedSize = resource.size 
          ? resource.size > 1024 * 1024 
            ? `${(resource.size / (1024 * 1024)).toFixed(1)} MB` 
            : resource.size > 1024
            ? `${(resource.size / 1024).toFixed(1)} KB`
            : `${resource.size} B`
          : 'Size unknown';

        return (
          <div
            key={resource.id}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="bg-gray-100 p-3 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span 
                  className="text-gray-700 font-medium block truncate"
                  title={fileName}
                >
                  {fileName}
                </span>
                <a
  href={`/api/download?url=${encodeURIComponent(resource.url)}&name=${encodeURIComponent(resource.name)}`}
  className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap ml-2"
>
  Download
</a>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span className="capitalize">{fileExtension || 'file'}</span>
                <span>{formattedSize}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
) : (
  <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
    <p className="text-gray-500 text-sm">No resources available for this round</p>
  </div>
)}
            </section>

            {/* Evaluation Criteria with Apple-style clean layout */}
            <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-4 text-gray-800">
                <div className="bg-purple-100 p-3 rounded-xl shadow-inner">
                  <FiAward className="text-purple-600" size={24} />
                </div>
                <span>Evaluation Criteria</span>
              </h2>
              {round.criteria && Object.keys(round.criteria).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(round.criteria).map(([criterion, weight]) => (
                    <div key={criterion} className="flex flex-col">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 text-lg">{criterion}</span>
                        <span className="text-gray-500 font-medium">{weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full shadow-sm" 
                          style={{ width: `${weight}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {/* Creator tips for judging */}
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 mt-6">
                    <h3 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                      <FiTool className="text-purple-600" />
                      Judging Insight
                    </h3>
                    <p className="text-purple-700 text-sm">
                      Judges typically spend just 2-3 minutes per submission. Make your strongest 
                      elements immediately visible and memorable.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No judging criteria provided.</p>
              )}
            </section>
          </div>

          {/* Right Column - Creator-focused Submission Panel */}
          <div className="space-y-8">
    {/* Submission Card with Adobe CC app styling */}
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-semibold flex items-center gap-4 text-gray-800">
          <div className="bg-green-100 p-3 rounded-xl shadow-inner">
            <FiUpload className="text-green-600" size={24} />
          </div>
          <span>Your Creation Station</span>
        </h2>
      </div>

      <div className="p-6">
        {!round.competition.isRegistered ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner">
              <FiUsers className="text-gray-400" size={28} />
            </div>
            <p className="text-gray-600 mb-4 text-lg">
              Join the competition to unlock this creative challenge.
            </p>
            <button
              disabled
              className="px-6 py-3 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed font-medium text-lg shadow-sm"
            >
              Register First
            </button>
          </div>
        ) : hasSubmission ? (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border shadow-sm ${
              latestSubmission?.status === 'approved'
                ? 'bg-green-50/50 border-green-200'
                : latestSubmission?.status === 'rejected'
                ? 'bg-red-50/50 border-red-200'
                : 'bg-blue-50/50 border-blue-200'
            }`}>
              <div className="flex items-center gap-4 mb-3">
                {latestSubmission?.status === 'approved' ? (
                  <FiCheckCircle className="text-green-500" size={24} />
                ) : latestSubmission?.status === 'rejected' ? (
                  <FiAlertCircle className="text-red-500" size={24} />
                ) : (
                  <FiClock className="text-blue-500" size={24} />
                )}
                <span className="font-medium text-lg">
                  {latestSubmission?.status === 'approved'
                    ? 'Approved! 🎉'
                    : latestSubmission?.status === 'rejected'
                    ? 'Needs Revision ✏️'
                    : 'In Review 🔍'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Submitted {formatDistanceToNow(new Date(latestSubmission!.submittedAt))} ago
              </p>
            </div>

            {latestSubmission?.feedback && (
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-medium mb-3 text-gray-700 text-lg">Judge's Feedback</h3>
                <p className="text-gray-600">{latestSubmission.feedback}</p>
              </div>
            )}

            {isActive && (
              <SubmitWorkForm 
                roundId={round.id} 
                competitionId={round.competition.id}
                existingSubmission={latestSubmission}
              />
            )}
          </div>
        ) : isActive ? (
          <SubmitWorkForm 
            roundId={round.id} 
            competitionId={round.competition.id}
          />
        ) : isPast ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner">
              <FiClock className="text-gray-400" size={28} />
            </div>
            <p className="text-lg">The creation period has ended.</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner">
              <FiCalendar className="text-gray-400" size={28} />
            </div>
            <p className="text-lg">Creation opens {formatDate(round.startDate)}</p>
            <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2 text-sm">Creator Prep</h3>
              <p className="text-blue-700 text-xs">
                Use this time to brainstorm and gather inspiration. Check the resources section for assets.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

            {/* Creator Toolkit - Lego-like modular blocks */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-semibold flex items-center gap-4 text-gray-800">
                  <div className="bg-orange-100 p-3 rounded-xl shadow-inner">
                    <FiGrid className="text-orange-600" size={24} />
                  </div>
                  <span>Creator Toolkit</span>
                </h2>
              </div>
              
              <div className="p-6">
                {round.submissionRules ? (
                  <div className="space-y-6">
                    {round.submissionRules.allowFileUpload && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-3 text-lg">File Specifications</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-gray-500 text-sm">1</span>
                            <span>Max size: <span className="font-medium">{round.submissionRules.maxFileSizeMB || 10}MB</span></span>
                          </li>
                          {round.submissionRules.allowedFileTypes && (
                            <li className="flex items-start gap-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-gray-500 text-sm">2</span>
                              <span>Formats: <span className="font-medium">{round.submissionRules.allowedFileTypes.join(', ')}</span></span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3 text-lg">Submission Policy</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-gray-500 text-sm">3</span>
                          <span>{round.submissionRules.allowExternalLinks ? 'External links allowed' : 'No external links'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-gray-500 text-sm">4</span>
                          <span>{round.submissionRules.acceptLateSubmissions ? 'Late submissions accepted' : 'No late submissions'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No specific guidelines provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundDetailsPage;