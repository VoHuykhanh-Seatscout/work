'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

type RubricItem = {
  name: string
  maxScore: number
}

export function RubricCreator({
  rubric,
  onRubricChange,
}: {
  rubric: RubricItem[]
  onRubricChange: (rubric: RubricItem[]) => void
}) {
  const addCriterion = () => {
    onRubricChange([...rubric, { name: '', maxScore: 10 }])
  }

  const updateCriterion = (
    index: number, 
    field: keyof RubricItem, 
    value: string | number
  ) => {
    const newRubric = [...rubric]
    newRubric[index] = {
      ...newRubric[index],
      [field]: field === 'maxScore' ? Number(value) : value
    }
    onRubricChange(newRubric)
  }

  const removeCriterion = (index: number) => {
    onRubricChange(rubric.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {rubric.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            value={item.name}
            onChange={(e) => updateCriterion(index, 'name', e.target.value)}
            placeholder="Criterion name"
          />
          <Input
            type="number"
            value={item.maxScore}
            onChange={(e) => updateCriterion(index, 'maxScore', e.target.value)}
            className="w-20"
            min="1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeCriterion(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addCriterion}>
        Add Criterion
      </Button>
    </div>
  )
}