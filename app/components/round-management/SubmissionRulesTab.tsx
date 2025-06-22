'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoundWithRelations } from "@/types/round"
import { Badge } from "@/components/ui/badge"
import { X, File, Link2, Clock, Zap, AlertCircle, Palette, Image, FileArchive, Wand2, PencilRuler, Sparkles } from "lucide-react"
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

interface SubmissionRulesTabProps {
  round: RoundWithRelations
  setRound: (round: RoundWithRelations) => void
}

export function SubmissionRulesTab({ round, setRound }: SubmissionRulesTabProps) {
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
              Submission Guidelines
            </CardTitle>
            <p className="text-sm text-amber-600/90 mt-1.5 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              <span className="font-medium">Define how creators can share their work</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8 relative z-10">
        {/* File Upload Section */}
        <motion.div 
          className={`p-5 rounded-xl border transition-all duration-300 ${round.submissionRules.allowFileUpload ? 
            'bg-white border-orange-200/70 shadow-sm hover:shadow-md' : 
            'bg-gray-50/50 border-gray-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-2.5 rounded-lg ${round.submissionRules.allowFileUpload ? 
                  'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}
                animate={{
                  rotate: round.submissionRules.allowFileUpload ? [0, 5, -5, 0] : 0,
                  scale: round.submissionRules.allowFileUpload ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <File className="w-5 h-5" />
              </motion.div>
              <div className="space-y-1">
                <Label htmlFor="allow-file-upload" className="text-base font-medium text-gray-800">
                  File Upload
                </Label>
                <p className="text-sm text-gray-500">
                  Allow participants to upload files
                </p>
              </div>
            </div>
            <Switch
              id="allow-file-upload"
              checked={round.submissionRules.allowFileUpload}
              onCheckedChange={(checked) => setRound({
                ...round,
                submissionRules: {
                  ...round.submissionRules,
                  allowFileUpload: checked
                }
              })}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          {round.submissionRules.allowFileUpload && (
            <motion.div 
              className="mt-6 ml-12 space-y-6 pl-5 border-l-2 border-orange-100/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {/* File Size Limit */}
              <motion.div 
                className="space-y-3"
                whileHover={{ x: 3 }}
              >
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Maximum file size
                </Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Input
                      type="number"
                      value={round.submissionRules.maxFileSizeMB}
                      onChange={(e) => setRound({
                        ...round,
                        submissionRules: {
                          ...round.submissionRules,
                          maxFileSizeMB: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-28 pl-8 bg-white border-gray-300 focus:border-orange-400"
                    />
                    <span className="absolute left-3 top-2.5 text-sm text-gray-400">MB</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {round.submissionRules.maxFileSizeMB > 100 ? 
                      "⚠️ Large files may be difficult to review" : 
                      "Recommended: 10-50MB"}
                  </span>
                </div>
              </motion.div>

              {/* File Types */}
              <motion.div 
                className="space-y-3"
                whileHover={{ x: 3 }}
              >
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Image className="w-4 h-4 text-orange-500" />
                  Allowed file types
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!round.submissionRules.allowedFileTypes.includes(value)) {
                        setRound({
                          ...round,
                          submissionRules: {
                            ...round.submissionRules,
                            allowedFileTypes: [
                              ...round.submissionRules.allowedFileTypes,
                              value
                            ]
                          }
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-white border-gray-300 focus:border-orange-400">
                      <SelectValue placeholder="Add file type" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200">
                      <SelectItem value=".pdf" className="hover:bg-orange-50">
                        <span className="flex items-center gap-2">
                          <File className="w-4 h-4 text-red-500" /> PDF
                        </span>
                      </SelectItem>
                      <SelectItem value=".doc,.docx" className="hover:bg-orange-50">
                        <span className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-500" /> Word
                        </span>
                      </SelectItem>
                      <SelectItem value=".ppt,.pptx" className="hover:bg-orange-50">
                        <span className="flex items-center gap-2">
                          <File className="w-4 h-4 text-orange-500" /> PowerPoint
                        </span>
                      </SelectItem>
                      <SelectItem value=".zip" className="hover:bg-orange-50">
                        <span className="flex items-center gap-2">
                          <FileArchive className="w-4 h-4 text-yellow-500" /> ZIP
                        </span>
                      </SelectItem>
                      <SelectItem value=".png,.jpg,.jpeg" className="hover:bg-orange-50">
                        <span className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-green-500" /> Images
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {round.submissionRules.allowedFileTypes.map((type, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge 
                        variant="outline"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-gray-300 hover:bg-orange-50 transition-colors"
                      >
                        {type.split(',').map(t => t.trim()).join(', ')}
                        <button
                          onClick={() => {
                            setRound({
                              ...round,
                              submissionRules: {
                                ...round.submissionRules,
                                allowedFileTypes: round.submissionRules.allowedFileTypes.filter((_, i) => i !== index)
                              }
                            })
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* External Links Section */}
        <motion.div 
          className={`p-5 rounded-xl border transition-all duration-300 ${round.submissionRules.allowExternalLinks ? 
            'bg-white border-amber-200/70 shadow-sm hover:shadow-md' : 
            'bg-gray-50/50 border-gray-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-2.5 rounded-lg ${round.submissionRules.allowExternalLinks ? 
                  'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                animate={{
                  rotate: round.submissionRules.allowExternalLinks ? [0, 5, -5, 0] : 0,
                  scale: round.submissionRules.allowExternalLinks ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <Link2 className="w-5 h-5" />
              </motion.div>
              <div className="space-y-1">
                <Label htmlFor="allow-external-links" className="text-base font-medium text-gray-800">
                  External Links
                </Label>
                <p className="text-sm text-gray-500">
                  Allow links to YouTube, Figma, etc.
                </p>
              </div>
            </div>
            <Switch
              id="allow-external-links"
              checked={round.submissionRules.allowExternalLinks}
              onCheckedChange={(checked) => setRound({
                ...round,
                submissionRules: {
                  ...round.submissionRules,
                  allowExternalLinks: checked
                }
              })}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </motion.div>

        {/* Late Submissions Section */}
        <motion.div 
          className={`p-5 rounded-xl border transition-all duration-300 ${round.submissionRules.acceptLateSubmissions ? 
            'bg-white border-red-200/70 shadow-sm hover:shadow-md' : 
            'bg-gray-50/50 border-gray-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-2.5 rounded-lg ${round.submissionRules.acceptLateSubmissions ? 
                  'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                animate={{
                  rotate: round.submissionRules.acceptLateSubmissions ? [0, 5, -5, 0] : 0,
                  scale: round.submissionRules.acceptLateSubmissions ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <AlertCircle className="w-5 h-5" />
              </motion.div>
              <div className="space-y-1">
                <Label htmlFor="accept-late-submissions" className="text-base font-medium text-gray-800">
                  Late Submissions
                </Label>
                <p className="text-sm text-gray-500">
                  Accept submissions after the deadline
                </p>
              </div>
            </div>
            <Switch
              id="accept-late-submissions"
              checked={round.submissionRules.acceptLateSubmissions}
              onCheckedChange={(checked) => setRound({
                ...round,
                submissionRules: {
                  ...round.submissionRules,
                  acceptLateSubmissions: checked
                }
              })}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
          {round.submissionRules.acceptLateSubmissions && (
            <motion.div 
              className="mt-4 ml-12 pl-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-200/50">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                </motion.div>
                <p className="text-xs text-red-700">
                  Late submissions will be clearly marked as such to judges. 
                  Consider whether this affects judging fairness.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Countdown Timer Section */}
        <motion.div 
          className={`p-5 rounded-xl border transition-all duration-300 ${round.submissionRules.showCountdown ? 
            'bg-white border-green-200/70 shadow-sm hover:shadow-md' : 
            'bg-gray-50/50 border-gray-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-2.5 rounded-lg ${round.submissionRules.showCountdown ? 
                  'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                animate={{
                  rotate: round.submissionRules.showCountdown ? [0, 5, -5, 0] : 0,
                  scale: round.submissionRules.showCountdown ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              <div className="space-y-1">
                <Label htmlFor="show-countdown" className="text-base font-medium text-gray-800">
                  Countdown Timer
                </Label>
                <p className="text-sm text-gray-500">
                  Show participants a deadline countdown
                </p>
              </div>
            </div>
            <Switch
              id="show-countdown"
              checked={round.submissionRules.showCountdown}
              onCheckedChange={(checked) => setRound({
                ...round,
                submissionRules: {
                  ...round.submissionRules,
                  showCountdown: checked
                }
              })}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          {round.submissionRules.showCountdown && (
            <motion.div 
              className="mt-4 ml-12 pl-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                </motion.div>
                <p className="text-xs text-green-700">
                  Creators will see a live countdown to help them manage their time effectively.
                </p>
              </div>
            </motion.div>
          )}
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
          "Clear rules make for fair competition and great creativity."
          <span className="block text-xs text-gray-400 mt-1">— Challenge Guidelines</span>
        </div>
        <div className="mt-3 text-[0.7rem] uppercase tracking-wider text-gray-400 flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400/30"></span>
          Submission Rules Configuration
          <span className="w-3 h-3 rounded-full bg-amber-400/30"></span>
        </div>
      </motion.div>
    </Card>
  )
}