import { z } from "zod";

// Shared enums that match your Prisma enums
const TeamFormation = z.enum(["SELF_FORMED", "ASSIGNED"]);
const Visibility = z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]);
const AudienceLevel = z.enum(["OPEN", "UNIVERSITY", "HIGH_SCHOOL", "PROFESSIONAL"]);
const JudgingMethod = z.enum(["PANEL", "PEER", "PUBLIC", "HYBRID"]);
const PromotionChannel = z.enum(["HOMEPAGE", "NEWSLETTER", "PAST_PARTICIPANTS", "SOCIAL_MEDIA"]);

// Remove the FlexibleEnum utility type as it's not needed
// We'll use the regular z.enum() with type assertions where needed

// Sub-schemas for nested structures
const PrizeSchema = z.object({
  title: z.string().min(1, "Prize title is required"),
  description: z.string().optional(),
  value: z.string().min(1, "Prize value is required"),
});

const RoundSchema = z.object({
  name: z.string().min(1, "Round name is required"),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().refine(
    date => date > new Date(), 
    "End date must be in the future"
  ),
  deliverables: z.string().optional(),
  judgingMethod: JudgingMethod,
  selectionCriteria: z.string().optional(),
});

const EligibilityCriteriaSchema = z.object({
  minAge: z.number().int().min(13).max(100).optional(),
  maxAge: z.number().int().min(13).max(100).optional(),
  educationLevels: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  teamRequirements: z.string().optional(),
  otherRequirements: z.string().optional(),
});

// Main competition schema
export const CompetitionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().min(1, "Tagline is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    coverImage: z.string().min(1, "Cover image is required"),
    logo: z.string().min(1, "Logo is required"),
    organizerName: z.string().min(1, "Organizer name is required"),
    contactEmail: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    website: z.string().url("Invalid URL").optional(),
    organizerDescription: z.string().min(1, "Organizer description is required"),
    detailedRules: z.string().min(100, "Detailed rules must be at least 100 characters"),
    
    eligibilityCriteria: z.object({
      minAge: z.number().min(13, "Minimum age must be at least 13"),
      maxAge: z.number().min(13, "Maximum age must be at least 13"),
      educationLevels: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      requiredSkills: z.array(z.string()).optional(),
      teamRequirements: z.string().optional(),
      otherRequirements: z.string().optional()
    }),
    
    prizes: z.array(z.object({
      title: z.string().min(1, "Prize title is required"),
      description: z.string().optional(),
      value: z.string().min(1, "Prize value is required")
    })).min(1, "At least one prize is required"),
    
    rounds: z.array(z.object({
      name: z.string().min(1, "Round name is required"),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      deliverables: z.string().optional(),
      judgingMethod: z.enum(["PANEL", "PEER", "PUBLIC", "HYBRID"]),
      selectionCriteria: z.string().optional()
    })).min(1, "At least one round is required"),
    
    teamFormation: z.enum(["SELF_FORMED", "ASSIGNED"]),
    minTeamSize: z.number().min(1, "Minimum team size must be at least 1"),
    maxTeamSize: z.number().min(1, "Maximum team size must be at least 1"),
    useTeamMatchingTool: z.boolean(),
    
    visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]),
    audienceLevel: z.enum(["OPEN", "UNIVERSITY", "HIGH_SCHOOL", "PROFESSIONAL"]),
    featuredImage: z.string().optional(),
    socialMediaDescription: z.string().min(20, "Social media description must be at least 20 characters"),
    tags: z.array(z.string()).optional(),
    promotionChannels: z.array(z.string()).optional(),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: "You must accept the terms and conditions"
    })
  });
// Schema for API responses
export const CompetitionResponseSchema = CompetitionSchema.extend({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "LIVE", "COMPLETED"]),
});

export const CompetitionDraftSchema = z.object({
    draftData: z.any().optional(), // Accept any partial data
    currentSection: z.number().int().min(0).max(5),
    competitionId: z.string().uuid().optional().nullable()
  });
  

// Type exports
export type CompetitionDraftInput = z.infer<typeof CompetitionDraftSchema>;
export type CompetitionInput = z.infer<typeof CompetitionSchema>;
export type CompetitionResponse = z.infer<typeof CompetitionResponseSchema>;