import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompetitionSchema, type CompetitionInput } from '@/schemas/competition';
import { validateCompetitionForm } from '@/utils/validation';
import type { ZodFormattedError } from 'zod';

export default function CompetitionForm({ 
  initialData = null, 
  competitionId = null 
}: { 
  initialData?: Partial<CompetitionInput> | null, 
  competitionId?: string | null 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CompetitionInput>>({
    // ... (keep your existing initial state)
  });

  const [errors, setErrors] = useState<ZodFormattedError<CompetitionInput> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateCompetitionForm(formData);
    
    if (!validation.isValid) {
        setErrors(validation.errors as ZodFormattedError<CompetitionInput>);
        return;
      }
    
    setIsSubmitting(true);
    try {
      const endpoint = competitionId 
        ? `/api/competitions?id=${competitionId}`
        : '/api/competitions';
        
      const method = competitionId ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        body: JSON.stringify(validation.data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save competition');
      }
      
      const result = await response.json();
      router.push(`/competitions/${result.data.id}`);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time field validation
  const validateField = (fieldName: keyof CompetitionInput) => {
    const validation = CompetitionSchema.safeParse({
      ...formData,
      [fieldName]: formData[fieldName]
    });
  
    setErrors((prev) => {
        if (!validation.success) {
          const formattedErrors = validation.error.format();
          
          return {
            ...formattedErrors,
            _errors: formattedErrors._errors ?? [], // Ensure _errors always exists as an array
          } as ZodFormattedError<CompetitionInput>;
        } 
      
        return null; // Explicitly returning null when validation passes
      });
  };
  
  
  

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: Partial<CompetitionInput>) => {
      let newValue: any = value;
      
      if (type === 'number') {
        newValue = Number(value);
      } else if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      }
      
      return {
        ...prev,
        [name]: newValue
      };
    });
    
    setTimeout(() => validateField(name as keyof CompetitionInput), 300);
  };

  // Handle nested object changes
  const handleNestedChange = <K extends keyof CompetitionInput>(
    parent: K,
    field: keyof NonNullable<CompetitionInput[K]>,
    value: any
  ) => {
    setFormData((prev: Partial<CompetitionInput>) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value
      }
    }));
    
    setTimeout(() => validateField(parent), 300);
  };

  // Add/remove array items
  const handleAddItem = (arrayName: keyof CompetitionInput, template: any) => {
    setFormData((prev: Partial<CompetitionInput>) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[]), template]
    }));
  };

  const handleRemoveItem = (arrayName: keyof CompetitionInput, index: number) => {
    setFormData((prev: Partial<CompetitionInput>) => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_, i) => i !== index)
    }));
  };

  // Render error messages
  const renderError = (fieldName: keyof CompetitionInput) => {
    if (!errors || !errors[fieldName]?._errors) return null;
    
    return (
      <div className="text-red-500 text-sm mt-1">
        {errors[fieldName]?._errors?.join(', ')}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title*
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title || ''}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            errors?.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {renderError('title')}
      </div>
      
      {/* Add other fields with the same pattern */}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Competition'}
      </button>
    </form>
  );
}