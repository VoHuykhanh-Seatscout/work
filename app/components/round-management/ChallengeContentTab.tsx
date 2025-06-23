'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { ResourceUploader } from "./ResourceUploader";
import { Lightbulb, FileText, UploadCloud, Sparkles, BookOpen, Wand2, PencilRuler, Zap, Layers } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast"
import type { RoundWithRelations } from '@/types/round';
import { m as motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
};

export interface ChallengeContentTabProps {
  markdownContent: string;
  setMarkdownContent: React.Dispatch<React.SetStateAction<string>>;
  round: RoundWithRelations;
  setRound: React.Dispatch<React.SetStateAction<RoundWithRelations | null>>;
  isUploading: boolean;
  removeResource: (index: number) => void;
  uploadProgress: number;
  handleResourceUpload: (file: File) => Promise<void>;
}

export function ChallengeContentTab({
  round,
  setRound,
  markdownContent,
  setMarkdownContent
}: ChallengeContentTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleResourceUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `/api/competitions/${round.competitionId}/rounds/${round.id}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setRound({
        ...round,
        resources: [...round.resources, {
          ...data.resource,
          type: data.resource.type || null,
          size: data.resource.size || null
        }]
      });

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
        variant: "default",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeResource = async (index: number) => {
    const resource = round.resources[index];
    if (!resource?.id || !resource?.publicId) return;

    try {
      const deleteResponse = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: resource.publicId,
          resourceType: resource.type?.includes('image') ? 'image' : 'raw'
        })
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete file from Cloudinary');
      }

      const dbResponse = await fetch(
        `/api/competitions/${round.competitionId}/rounds/${round.id}/resources/${resource.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!dbResponse.ok) {
        throw new Error('Failed to delete resource record');
      }

      const updatedResources = [...round.resources];
      updatedResources.splice(index, 1);
      setRound({
        ...round,
        resources: updatedResources
      });

      toast({
        title: "Resource deleted",
        description: `${resource.name} has been removed`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error removing resource:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-orange-50 to-amber-50 rounded-3xl overflow-hidden backdrop-blur-sm relative">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              backgroundColor: Object.values(brandColors)[
                Math.floor(Math.random() * Object.keys(brandColors).length)
              ],
              opacity: Math.random() * 0.3 + 0.1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 20],
              y: [0, (Math.random() - 0.5) * 20],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header with creative gradient */}
      <CardHeader className="relative border-b border-orange-100/30 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-red-400"></div>
        <div className="flex items-start space-x-5">
          <motion.div 
            className="p-3.5 rounded-2xl bg-white shadow-lg border border-orange-100/50"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <PencilRuler className="w-6 h-6" />
            </div>
          </motion.div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 tracking-tight">
              Challenge Content Studio
            </CardTitle>
            <p className="text-sm text-amber-600/90 mt-1.5 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              <span className="font-medium">Craft your creative brief</span>
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8 relative z-10">
        {/* Markdown Editor Section */}
        <motion.div 
          className="space-y-3 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Creative Brief & Instructions</span>
            </Label>
            <Badge className="text-xs bg-orange-100 text-orange-800">Required</Badge>
          </div>
          <motion.div 
            className="rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70 min-h-[400px] overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <MarkdownEditor
              value={markdownContent}
              onChange={setMarkdownContent}
              placeholder="## Welcome creators! ✨\n\nDescribe your challenge in detail..."
            />
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 text-xs text-amber-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Pro tip: Use markdown to format beautiful instructions with headings, lists, and more</span>
          </motion.div>
        </motion.div>

        {/* Resources Section */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Supporting Resources</span>
            </Label>
            <span className="text-xs text-amber-600">
              {round.resources.length} file{round.resources.length !== 1 ? 's' : ''} attached
            </span>
          </div>
          
          <motion.div 
            className="space-y-3"
            whileHover={{ y: -2 }}
          >
            <ResourceUploader
              resources={round.resources.map(r => ({
                ...r,
                type: r.type || undefined,
                size: r.size || undefined
              }))}
              onUpload={handleResourceUpload}
              onRemove={removeResource}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
            
            {isUploading && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between text-xs text-amber-700">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="h-2 bg-amber-100" 
                />
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="p-4 bg-gradient-to-r from-amber-50/70 to-orange-50/70 rounded-xl border border-amber-100/70 shadow-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start gap-3">
              <motion.div 
                className="p-2 bg-white rounded-lg text-amber-600 border border-amber-200/50 shadow-xs"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <div>
                <p className="text-xs font-medium text-amber-700">Resource suggestions</p>
                <p className="text-xs text-amber-600/90 mt-1 leading-relaxed">
                  Consider adding: Design assets, reference materials, templates, or example submissions
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 text-left hover:shadow-md transition-all"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Preview Brief</p>
              <p className="text-xs text-gray-500 mt-1">See how participants will view this</p>
            </div>
          </motion.button>
          
          <motion.button
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 text-left hover:shadow-md transition-all"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">View Examples</p>
              <p className="text-xs text-gray-500 mt-1">Get inspired by other challenges</p>
            </div>
          </motion.button>
        </motion.div>
      </CardContent>
      
      {/* Footer */}
      <motion.div 
        className="px-6 py-5 bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-t border-amber-100/30 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          "Creativity is intelligence having fun." 
          <span className="block text-xs text-gray-400 mt-1">— Albert Einstein</span>
        </div>
        <div className="mt-3 text-[0.7rem] uppercase tracking-wider text-gray-400 flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400/30"></span>
          Content Studio
          <span className="w-3 h-3 rounded-full bg-amber-400/30"></span>
        </div>
      </motion.div>
    </Card>
  );
}