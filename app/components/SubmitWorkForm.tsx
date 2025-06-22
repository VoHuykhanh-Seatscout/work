'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, File, Presentation, FileArchive, Image, X, UploadCloud, CheckCircle, Link2, Trash2, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface SubmitWorkFormProps {
  roundId: string;
  competitionId: string;
  existingSubmission?: {
    id: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback: string | null; 
    files?: Array<{ url: string; name: string; type?: string; size?: number; publicId?: string }>;
    links?: string[];
  } | null;
}

const FileIcon = ({ type }: { type?: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-4 w-4 text-red-500" />,
    doc: <File className="h-4 w-4 text-blue-500" />,
    docx: <File className="h-4 w-4 text-blue-500" />,
    ppt: <Presentation className="h-4 w-4 text-orange-500" />,
    pptx: <Presentation className="h-4 w-4 text-orange-500" />,
    zip: <FileArchive className="h-4 w-4 text-yellow-500" />,
    jpeg: <Image className="h-4 w-4 text-green-500" />,
    jpg: <Image className="h-4 w-4 text-green-500" />,
    png: <Image className="h-4 w-4 text-green-500" />,
    gif: <Image className="h-4 w-4 text-green-500" />,
  };

  return type ? (iconMap[type] || <File className="h-4 w-4 text-gray-500" />) : <File className="h-4 w-4 text-gray-500" />;
};

const getFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const FileItem = ({ fileObj, onRemove, isSubmitting }: { 
  fileObj: any, 
  onRemove: () => void, 
  isSubmitting: boolean 
}) => {
  // Create a download URL with proper filename
  const downloadUrl = fileObj.url 
    ? fileObj.url.includes('?') 
      ? `${fileObj.url.split('?')[0]}?fl_attachment=${encodeURIComponent(fileObj.name)}`
      : `${fileObj.url}?fl_attachment=${encodeURIComponent(fileObj.name)}`
    : '';

  return (
    <li className={cn(
      "flex items-center justify-between p-3 border rounded-lg transition-colors",
      fileObj.isUploading ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {fileObj.isUploading ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        ) : (
          <FileIcon type={fileObj.type} />
        )}
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium text-sm">{fileObj.name}</div>
          <div className="text-xs text-muted-foreground">
            {fileObj.type && `${fileObj.type.toUpperCase()} • `}
            {getFileSize(fileObj.size)}
            {fileObj.isUploading && " • Uploading..."}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {fileObj.url && !fileObj.isUploading && (
          <>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="p-2 h-auto"
            >
              <a 
                href={downloadUrl}
                download={fileObj.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="p-2 h-auto"
            >
              <a 
                href={fileObj.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isSubmitting || fileObj.isUploading}
          className="text-red-500 hover:text-red-700 p-2 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};

export default function SubmitWorkForm({ 
  roundId, 
  competitionId,
  existingSubmission 
}: SubmitWorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>(existingSubmission?.links || []);
  const [files, setFiles] = useState<Array<{ 
    file?: File; 
    url?: string; 
    name: string; 
    type?: string; 
    size?: number; 
    preview?: string;
    publicId?: string;
    isUploading?: boolean;
  }>>(
    existingSubmission?.files?.map(file => ({ 
      url: file.url, 
      name: file.name,
      type: file.type,
      size: file.size,
      publicId: file.publicId
    })) || []
  );
  const [newLink, setNewLink] = useState('');
  const [notes, setNotes] = useState('');

  const getFileInfo = (file: File) => {
    const nameParts = file.name.split('.');
    const extension = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : '';
    
    const mimeParts = file.type.split('/');
    const type = mimeParts.length > 1 ? mimeParts.pop()?.toLowerCase() : '';
    
    const typeMap: Record<string, string> = {
      'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'vnd.ms-excel': 'xls',
      'vnd.ms-powerpoint': 'ppt',
      'msword': 'doc',
      'plain': 'txt',
      'quicktime': 'mov',
      'x-m4v': 'm4v',
      'x-mpeg': 'mpg',
    };

    const resolvedType = typeMap[type || ''] || extension || type || 'file';

    return {
      extension,
      type: resolvedType,
    };
  };

  const uploadFileToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name); // Send original filename

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const deleteFileFromCloudinary = async (publicId: string) => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => {
        const { type } = getFileInfo(file);
        return {
          file,
          name: file.name,
          type,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          isUploading: true
        };
      });
      
      setFiles(prev => [...prev, ...newFiles]);
      
      for (const fileObj of newFiles) {
        try {
          const result = await uploadFileToCloudinary(fileObj.file!);
          
          setFiles(prev => prev.map(f => 
            f.name === fileObj.name 
              ? { 
                  ...f, 
                  url: result.imageUrl, 
                  publicId: result.public_id,
                  isUploading: false 
                } 
              : f
          ));
          
          toast({
            title: "Upload complete",
            description: `${fileObj.name} has been uploaded successfully`,
            variant: "default",
          });
        } catch (error) {
          setFiles(prev => prev.filter(f => f.name !== fileObj.name));
          toast({
            title: "Upload failed",
            description: `Failed to upload ${fileObj.name}`,
            variant: "destructive",
          });
        }
      }
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    
    try {
      if (fileToRemove.publicId) {
        await deleteFileFromCloudinary(fileToRemove.publicId);
      }
      
      setFiles(prev => {
        const newFiles = [...prev];
        const removed = newFiles.splice(index, 1);
        if ('preview' in removed[0] && removed[0].preview) {
          URL.revokeObjectURL(removed[0].preview);
        }
        return newFiles;
      });
      
      toast({
        title: "File removed",
        description: "The file has been deleted",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete the file",
        variant: "destructive",
      });
    }
  };

  const addLink = () => {
    if (newLink.trim()) {
      if (!links.includes(newLink.trim())) {
        setLinks(prev => [...prev, newLink.trim()]);
        setNewLink('');
        toast({
          title: "Link added",
          description: "Your link has been added to the submission",
          variant: "default",
        });
      } else {
        toast({
          title: "Link already exists",
          description: "This link has already been added",
          variant: "destructive",
        });
      }
    }
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Link removed",
      description: "The link has been removed from your submission",
      variant: "default",
    });
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const isUploading = files.some(file => file.isUploading);
      if (isUploading) {
        throw new Error('Please wait for all files to finish uploading');
      }

      const submissionData = {
        roundId,
        competitionId,
        notes,
        links,
        files: files.map(file => ({
          url: file.url,
          name: file.name,
          type: file.type,
          size: file.size,
          publicId: file.publicId
        }))
      };

      const url = existingSubmission 
        ? `/api/submissions/${existingSubmission.id}`
        : '/api/submissions';

      const method = existingSubmission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      setSuccess(existingSubmission 
        ? 'Your submission has been updated successfully!'
        : 'Your submission has been received!');
      
      toast({
        title: "Submission successful",
        description: existingSubmission 
          ? "Your submission has been updated" 
          : "Your work has been submitted",
        variant: "default",
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Upload Your Work</Label>
          <p className="text-sm text-muted-foreground">
            Upload files that showcase your submission (PDF, Images, Docs, etc.)
          </p>
        </div>

        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isSubmitting ? "border-blue-200 bg-blue-50" : 
            "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
          )}
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
            <UploadCloud className={cn(
              "h-8 w-8",
              isSubmitting ? "text-blue-500 animate-bounce" : "text-gray-400"
            )} />
            <div>
              <p className="font-medium">
                {isSubmitting ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Max file size: 50MB
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            disabled={isSubmitting}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
            <ul className="space-y-2">
              {files.map((fileObj, index) => (
                <FileItem
                  key={index}
                  fileObj={fileObj}
                  onRemove={() => removeFile(index)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">External Links</Label>
          <p className="text-sm text-muted-foreground">
            Add links to external resources (GitHub, Figma, YouTube, etc.)
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="url"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={addLink}
            disabled={isSubmitting || !newLink.trim()}
          >
            Add Link
          </Button>
        </div>

        {links.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Added Links ({links.length})</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0"
                    >
                      <div className="truncate font-medium text-sm">{link}</div>
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      removeLink(index);
                    }}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 p-2 h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notes to Judges (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Explain any special considerations or aspects you'd like the judges to focus on
          </p>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional information about your submission..."
          disabled={isSubmitting}
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || (files.length === 0 && links.length === 0) || files.some(f => f.isUploading)}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          'Submitting...'
        ) : existingSubmission ? (
          'Update Submission'
        ) : (
          'Submit Your Work'
        )}
      </Button>
    </form>
  );
}