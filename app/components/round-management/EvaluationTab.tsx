'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RoundWithRelations } from "@/types/round"
import { RubricCreator } from "@/components/rubric-creator"
import { JudgeAssignment } from "@/components/judge-assignment"
import { Award, Gauge, Users, Scale, Sparkles, Wand2, Zap, BookOpen, ClipboardList, UserCog, Weight, ListChecks, Star, BadgePercent, Lightbulb, Info } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface EvaluationTabProps {
  round: RoundWithRelations
  setRound: (round: RoundWithRelations) => void
  competitionId: string
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

export function EvaluationTab({ round, setRound, competitionId }: EvaluationTabProps) {
  const rubricLength = round.evaluation?.rubric?.length || 0
  const judgesLength = round.evaluation?.judges?.length || 0
  const hasWeight = round.evaluation?.weight !== undefined && round.evaluation?.weight !== null
  
  const completionPercentage = Math.min(
    (rubricLength > 0 ? 40 : 0) +
    (judgesLength > 0 ? 30 : 0) +
    (hasWeight ? 30 : 0),
    100
  )

  return (
    <div className="space-y-6">
      {/* Dynamic header with progress */}
      <motion.div 
        className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100/50 shadow-sm relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(circle at 10% 20%, ${brandColors.primary}08, transparent 40%)`,
                `radial-gradient(ellipse at 90% 80%, ${brandColors.secondary}06, transparent 50%)`,
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 rounded-xl bg-white shadow-sm border border-orange-100"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="w-6 h-6 text-orange-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 tracking-tight">
                Evaluation Studio
              </h2>
              <p className="text-sm text-amber-600/90 mt-1 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4" />
                <span>Define how submissions will be judged and scored</span>
              </p>
            </div>
          </div>
          <div className="w-64">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span className="font-medium">Setup Progress</span>
              <span className="font-semibold text-orange-600">{completionPercentage}%</span>
            </div>
            <motion.div 
              className="h-2 bg-orange-100 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Rubric */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden relative">
              {/* Decorative header */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
              
              <CardHeader className="border-b border-orange-100/50">
                <CardTitle className="flex items-center gap-3">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-orange-100 text-orange-600"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity
                    }}
                  >
                    <ClipboardList className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Scoring Rubric</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Define the criteria for evaluating submissions
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RubricCreator
                  rubric={round.evaluation?.rubric || []}
                  onRubricChange={(rubric) => setRound({
                    ...round,
                    evaluation: {
                      ...(round.evaluation || {}),
                      rubric,
                      weight: round.evaluation?.weight || 0
                    }
                  })}
                />
                
                {/* Tips section */}
                {rubricLength === 0 && (
                  <motion.div 
                    className="mt-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-orange-600">Rubric Tips</p>
                        <p className="mt-1">Create 3-5 clear criteria that cover different aspects of the submission. Consider including:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Creativity and originality</li>
                          <li>Technical execution</li>
                          <li>Presentation quality</li>
                          <li>Adherence to requirements</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Judge assignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
              
              <CardHeader className="border-b border-orange-100/50">
                <CardTitle className="flex items-center gap-3">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-amber-100 text-amber-600"
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity
                    }}
                  >
                    <UserCog className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Judge Assignment</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Select who will evaluate submissions
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <JudgeAssignment
                  competitionId={competitionId}
                  assignedJudges={round.evaluation?.judges || []}
                  onJudgesChange={(judges) => setRound({
                    ...round,
                    evaluation: {
                      ...(round.evaluation || {}),
                      judges
                    }
                  })}
                />
                
                {/* Status indicator */}
                <motion.div 
                  className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
                    judgesLength > 0 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {judgesLength > 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{judgesLength} {judgesLength === 1 ? 'judge' : 'judges'} assigned</span>
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4 text-amber-500" />
                      <span>No judges assigned yet</span>
                    </>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Round weight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
              
              <CardHeader className="border-b border-orange-100/50">
                <CardTitle className="flex items-center gap-3">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-orange-100 text-orange-600"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity
                    }}
                  >
                    <Weight className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Round Weight</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      How much this round contributes to the final score
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <BadgePercent className="w-4 h-4 text-orange-500" />
                      <span>Weight Percentage</span>
                    </Label>
                    <div className="relative w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={round.evaluation?.weight || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRound({
                          ...round,
                          evaluation: {
                            ...(round.evaluation || {}),
                            weight: parseInt(e.target.value) || 0
                          }
                        })}
                        className="pr-10 text-right font-medium border-orange-200 hover:border-orange-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                      />
                      <span className="absolute right-3 top-2 text-gray-400">%</span>
                    </div>
                  </div>
                  
                  {/* Visual indicator */}
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${round.evaluation?.weight || 0}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                    <motion.div
                      className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity
                      }}
                    >
                      {round.evaluation?.weight || 0}%
                    </motion.div>
                  </motion.div>
                  
                  {/* Weight guidance */}
                  <motion.div 
                    className="mt-4 p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-orange-600">Weight Guidance</p>
                        <p className="mt-1">Consider giving more weight to rounds that are more important or require more effort from participants.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg bg-gradient-to-br from-orange-50/70 to-amber-50/70 rounded-2xl overflow-hidden border border-orange-100/30">
              <CardHeader className="border-b border-orange-100/30">
                <CardTitle className="flex items-center gap-3">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-white text-orange-600 shadow-sm border border-orange-100"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Evaluation Tips</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Best practices for effective judging
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <motion.li 
                    className="flex items-start gap-3"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mt-0.5">
                      <ListChecks className="w-3.5 h-3.5" />
                    </div>
                    <span>Balance creativity with technical skill in your rubric</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-3"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>Assign judges with relevant expertise for the round</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-3"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mt-0.5">
                      <Star className="w-3.5 h-3.5" />
                    </div>
                    <span>Consider weighting based on round importance</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-3"
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span>Provide clear judging guidelines to all judges</span>
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}