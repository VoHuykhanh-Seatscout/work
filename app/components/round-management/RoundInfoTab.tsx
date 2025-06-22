'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RoundWithRelations } from "@/types/round"
import { PencilRuler, Calendar, Eye, EyeOff, Clock, Palette, Award, Sparkles, Lightbulb, Rocket, Layers, Brush, Wand2, PaintBucket, Trophy, Users, Zap, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export interface RoundInfoTabProps {
  round: RoundWithRelations;
  handleDateChange: (field: "startDate" | "endDate", value: string) => void;
}

const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
};

export function RoundInfoTab({ round }: RoundInfoTabProps) {
    const formattedStartDate = round.startDate ? format(new Date(round.startDate), 'MMMM d, yyyy') : 'Not set'
    const formattedEndDate = round.endDate ? format(new Date(round.endDate), 'MMMM d, yyyy') : 'Not set'
    const isActive = round.status === 'live'
    const daysLeft = round.endDate ? Math.ceil((new Date(round.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

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
                            <span className="font-medium">Challenge Round</span>
                        </p>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-8 relative z-10">
                {/* Title Section */}
                <motion.div 
                    className="space-y-3 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Round Title</span>
                        </Label>
                        <Badge className="text-xs bg-orange-100 text-orange-800">Required</Badge>
                    </div>
                    <motion.div 
                        className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-orange-200/70"
                        whileHover={{ y: -2 }}
                    >
                        <p className="text-gray-900 font-semibold text-xl tracking-tight">{round.name}</p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            This is how participants will recognize your round in the challenge
                        </p>
                    </motion.div>
                </motion.div>

                {/* Description Section */}
                <motion.div 
                    className="space-y-3 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-500" />
                            <span>Round Description</span>
                        </Label>
                        <Badge className="text-xs bg-amber-100 text-amber-800">Inspire Participants</Badge>
                    </div>
                    <motion.div 
                        className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm min-h-[160px] transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70"
                        whileHover={{ y: -2 }}
                    >
                        {round.description ? (
                            <div className="prose prose-sm max-w-none text-gray-700">
                                {round.description}
                            </div>
                        ) : (
                            <motion.div 
                                className="text-center py-8 flex flex-col items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.div 
                                    className="p-3 mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-amber-500 border border-amber-200/50"
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity
                                    }}
                                >
                                    <Lightbulb className="w-5 h-5" />
                                </motion.div>
                                <p className="text-gray-400 text-sm font-medium">No description provided yet</p>
                                <p className="text-xs text-gray-400 mt-3 max-w-[260px] leading-relaxed">
                                    Inspire participants with clear goals and expectations for this round.
                                </p>
                                <motion.button 
                                    className="mt-4 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Add Description
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Timeline Section */}
                <motion.div 
                    className="space-y-4 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                    <motion.div 
                        className={`flex items-start gap-4 text-sm p-4 rounded-xl ${isActive ? 
                            'bg-green-50/80 text-green-700 border border-green-200/70' : 
                            'bg-amber-50/80 text-amber-700 border border-amber-200/70'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
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
                        {isActive && (
                            <motion.button
                                className="text-xs font-medium bg-white border border-green-200 text-green-600 px-3 py-1.5 rounded-full shadow-xs hover:shadow-sm transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Extend Deadline
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>

                {/* Visibility Status */}
                <motion.div 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-200/70"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -3 }}
                >
                    <div className="flex items-start space-x-4">
                        {isActive ? (
                            <motion.div 
                                className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-200/70"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity
                                }}
                            >
                                <Eye className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity
                                }}
                            >
                                <EyeOff className="w-5 h-5" />
                            </motion.div>
                        )}
                        <div>
                            <Label className="text-sm font-semibold text-gray-800">
                                Round Visibility
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                                {isActive ? 'Visible to all participants' : 'Currently not active'}
                            </p>
                        </div>
                    </div>
                    <motion.div
                        className={`mt-3 sm:mt-0 px-4 py-2 rounded-full text-sm font-semibold ${
                            isActive ? 'bg-green-100 text-green-800 border border-green-300/70' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300/70'
                        }`}
                        whileHover={{ scale: 1.05 }}
                    >
                        {isActive ? (
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Active Round
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <span>Inactive</span>
                            </span>
                        )}
                    </motion.div>
                </motion.div>

                {/* Judging Method */}
                {round.judgingMethod && (
                    <motion.div 
                        className="space-y-3 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span>Evaluation Method</span>
                        </Label>
                        <motion.div 
                            className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-orange-200/70"
                            whileHover={{ y: -3 }}
                        >
                            <div className="flex items-start gap-3">
                                <motion.div 
                                    className="p-2 bg-amber-50 rounded-lg text-amber-600"
                                    animate={{
                                        y: [0, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity
                                    }}
                                >
                                    <PaintBucket className="w-4 h-4" />
                                </motion.div>
                                <div>
                                    <p className="text-gray-900 font-medium">{round.judgingMethod}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        How submissions will be evaluated in this round
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Additional Info */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {/* Participants */}
                    <motion.div 
                        className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
                        whileHover={{ y: -3 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">Participants</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Open to all qualified entrants
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Deliverables */}
                    <motion.div 
                        className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
                        whileHover={{ y: -3 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">Deliverables</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Required submissions for this round
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </CardContent>
            
            {/* Footer */}
            <motion.div 
                className="px-6 py-5 bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-t border-amber-100/30 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    "Great things are done by a series of small things brought together." 
                    <span className="block text-xs text-gray-400 mt-1">— Vincent Van Gogh</span>
                </div>
                <div className="mt-3 text-[0.7rem] uppercase tracking-wider text-gray-400 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-400/30"></span>
                    Challenge Round Dashboard
                    <span className="w-3 h-3 rounded-full bg-amber-400/30"></span>
                </div>
            </motion.div>
        </Card>
    )
}