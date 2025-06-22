'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, File, FileUp, Link as LinkIcon, Sparkles, Award, Zap, Lightbulb, Wand2, PencilRuler, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { RoundWithRelations } from "@/types/round"
import { MarkdownPreview } from "@/components/ui/markdown-preview"
import { motion } from "framer-motion"

const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
};

interface PreviewTabProps {
  round: RoundWithRelations
  markdownContent: string
}

export function PreviewTab({ round, markdownContent }: PreviewTabProps) {
  const formattedStartDate = format(new Date(round.startDate), 'MMMM d, yyyy')
  const formattedEndDate = format(new Date(round.endDate), 'MMMM d, yyyy')
  const daysLeft = round.endDate ? Math.ceil((new Date(round.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
  const isActive = round.status === 'live'

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
              {round.name}
            </CardTitle>
            <p className="text-sm text-amber-600/90 mt-1.5 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              <span className="font-medium">Challenge Preview</span>
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8 relative z-10">
        {/* Timeline Section */}
        <motion.div 
          className="space-y-4 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Round Timeline</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div 
              className="space-y-2"
              whileHover={{ y: -3 }}
            >
              <Label className="text-xs font-medium text-gray-500">Start Date</Label>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70">
                <motion.div 
                  className="relative flex-shrink-0"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping"></div>
                </motion.div>
                <div>
                  <p className="text-gray-900 font-medium">{formattedStartDate}</p>
                  <p className="text-xs text-gray-400 mt-0.5">When this round begins</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="space-y-2"
              whileHover={{ y: -3 }}
            >
              <Label className="text-xs font-medium text-gray-500">End Date</Label>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70">
                <motion.div 
                  className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                />
                <div>
                  <p className="text-gray-900 font-medium">{formattedEndDate}</p>
                  <p className="text-xs text-gray-400 mt-0.5">When this round concludes</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Status Indicator */}
          {round.submissionRules.showCountdown && (
            <motion.div 
              className={`flex items-start gap-4 text-sm p-4 rounded-xl ${isActive ? 
                'bg-green-50/80 text-green-700 border border-green-200/70' : 
                'bg-amber-50/80 text-amber-700 border border-amber-200/70'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {isActive ? 'Round is active!' : 'Round will begin soon'}
                </p>
                {isActive && round.endDate && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    {daysLeft > 0 ? (
                      <span><span className="font-semibold">{Math.ceil(daysLeft)} days</span> remaining to complete this round</span>
                    ) : (
                      'Final day to complete this round!'
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content Section */}
        <motion.div 
          className="space-y-3 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Challenge Details</span>
          </Label>
          <motion.div 
            className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm min-h-[160px] transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70"
            whileHover={{ y: -2 }}
          >
            <MarkdownPreview source={markdownContent} className="prose max-w-none" />
          </motion.div>
        </motion.div>

        {/* Resources Section */}
        {round.resources.length > 0 && (
          <motion.div 
            className="space-y-3 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <File className="w-4 h-4 text-amber-500" />
              <span>Resources</span>
            </Label>
            <motion.div 
              className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70"
              whileHover={{ y: -2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {round.resources.map((resource, index) => (
                  <motion.a 
                    key={index}
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-orange-50/50 transition-colors group"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-3 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                      <File className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resource.name}</p>
                      <p className="text-sm text-gray-500 truncate">{resource.url}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Submission Section */}
        <motion.div 
          className="space-y-3 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-amber-500" />
            <span>Submit Your Work</span>
          </Label>
          <motion.div 
            className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70"
            whileHover={{ y: -2 }}
          >
            {round.submissionRules.allowFileUpload && (
              <div className="mb-6">
                <Label className="flex items-center gap-2 mb-3 text-sm">
                  <FileUp className="w-4 h-4" />
                  Upload files
                </Label>
                <motion.div 
                  className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center bg-orange-50/50 hover:bg-orange-100/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.005 }}
                >
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-orange-200">
                    <FileUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <p className="font-medium">Drag and drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  <div className="mt-4 flex justify-center gap-3 flex-wrap">
                    <Badge variant="outline" className="px-3 py-1 bg-orange-100/50 border-orange-200 text-orange-800">
                      Max {round.submissionRules.maxFileSizeMB}MB
                    </Badge>
                    {round.submissionRules.allowedFileTypes.map((type, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1 bg-orange-100/50 border-orange-200 text-orange-800">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {round.submissionRules.allowExternalLinks && (
              <div className="mb-6">
                <Label className="flex items-center gap-2 mb-3 text-sm">
                  <LinkIcon className="w-4 h-4" />
                  Or submit a link
                </Label>
                <div className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                  />
                  <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                    Verify Link
                  </Button>
                </div>
              </div>
            )}

            <motion.div 
              className="pt-4"
              whileHover={{ scale: 1.01 }}
            >
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
              >
                Submit Entry
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Creative Tips */}
        <motion.div 
          className="bg-gradient-to-br from-orange-50/70 to-amber-50/70 p-6 rounded-xl border border-orange-100/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <motion.div 
              className="p-3 rounded-lg bg-orange-100 text-orange-600"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity
              }}
            >
              <Lightbulb className="w-5 h-5" />
            </motion.div>
            <div>
              <h4 className="font-medium text-orange-800 mb-2">Creative Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Sparkles className="w-4 h-4" />, text: "Showcase your unique creative perspective" },
                  { icon: <Award className="w-4 h-4" />, text: "Focus on quality over quantity" },
                  { icon: <Zap className="w-4 h-4" />, text: "Make your submission stand out in the first impression" },
                  { icon: <File className="w-4 h-4" />, text: "Follow all submission guidelines carefully" }
                ].map((tip, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-2"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-full bg-white border border-orange-200 text-orange-600">
                      {tip.icon}
                    </div>
                    <p className="text-sm text-gray-700">{tip.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
      
      {/* Footer */}
      <motion.div 
        className="px-6 py-5 bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-t border-amber-100/30 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          "Creativity is intelligence having fun." 
          <span className="block text-xs text-gray-400 mt-1">— Albert Einstein</span>
        </div>
        <div className="mt-3 text-[0.7rem] uppercase tracking-wider text-gray-400 flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400/30"></span>
          Challenge Submission Portal
          <span className="w-3 h-3 rounded-full bg-amber-400/30"></span>
        </div>
      </motion.div>
    </Card>
  )
}