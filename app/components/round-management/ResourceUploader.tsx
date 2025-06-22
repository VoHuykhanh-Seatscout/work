'use client'

import { FileText, File, Presentation, FileArchive, Image, X, UploadCloud, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/FileUpload';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast"

interface Resource {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  publicId?: string;
}

interface ResourceUploaderProps {
  resources: Resource[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (index: number) => void;
  isUploading: boolean;
  uploadProgress?: number;
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

export function ResourceUploader({ 
  resources, 
  onUpload, 
  onRemove, 
  isUploading,
  uploadProgress = 0 
}: ResourceUploaderProps) {
  const { toast } = useToast(); // Destructure toast from useToast
  const [recentlyUploaded, setRecentlyUploaded] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (recentlyUploaded.length > 0) {
      const timer = setTimeout(() => {
        setRecentlyUploaded([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyUploaded]);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => {
        setUploadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    
    setUploadError(null);
    
    try {
      await onUpload(file);
      setRecentlyUploaded(prev => [...prev, file.name]);
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded`,
        variant: "default",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(`Failed to upload ${file.name}. Please try again.`);
      toast({
        title: "Upload failed",
        description: `Could not upload ${file.name}`,
        variant: "destructive",
      });
    }
  };

  const getFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Supporting Resources</Label>
        <p className="text-sm text-muted-foreground">
          Upload files to help participants (PDF, Images, Docs, etc.)
        </p>
      </div>

      <div className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors relative",
        isUploading ? "border-blue-200 bg-blue-50" : 
        uploadError ? "border-red-200 bg-red-50" : 
        "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
      )}>
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          <UploadCloud className={cn(
            "h-8 w-8",
            isUploading ? "text-blue-500 animate-bounce" : 
            uploadError ? "text-red-500" : 
            "text-gray-400"
          )} />
          <div>
            <p className="font-medium">
              {isUploading ? 'Uploading...' : 
               uploadError ? 'Upload failed' : 
               'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadError ? uploadError : 'Max file size: 50MB'}
            </p>
          </div>
        </div>
        <FileUpload
          name="resources"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx,.ppt,.pptx"
          maxSize={50 * 1024 * 1024}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-blue-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {resources.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Files ({resources.length})</h4>
          <ul className="space-y-2">
            {resources.map((resource, index) => (
              <li 
                key={resource.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg transition-colors",
                  recentlyUploaded.includes(resource.name) 
                    ? "bg-green-50 border-green-200" 
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {recentlyUploaded.includes(resource.name) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <FileIcon type={resource.type} />
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
                  >
                    <div className="truncate font-medium text-sm">{resource.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {resource.type && `${resource.type.toUpperCase()} • `}
                      {getFileSize(resource.size)}
                    </div>
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  disabled={isUploading}
                  className="text-red-500 hover:text-red-700 p-2 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}