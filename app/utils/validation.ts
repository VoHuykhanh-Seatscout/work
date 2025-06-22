import { CompetitionSchema } from "@/schemas/competition";
import type { CompetitionInput } from "@/schemas/competition";

export const validateCompetitionForm = (data: Partial<CompetitionInput>) => {
  const result = CompetitionSchema.safeParse(data);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.format()
    };
  }
  
  return {
    isValid: true,
    data: result.data,
    errors: null
  };
};