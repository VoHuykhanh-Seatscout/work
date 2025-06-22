"use client";
import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string | null;
  onChange: (date: string) => void;
  minDate?: string | null;
  maxDate?: string | null;
  showTimeSelect?: boolean;
}

export const DatePicker = ({ 
  value, 
  onChange, 
  minDate, 
  maxDate 
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize selected date from value prop
  useEffect(() => {
    if (value) {
      // Create date in local timezone by adding time component
      const date = new Date(value + 'T12:00:00');
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      setSelectedDate(date);
      onChange(dateString);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      // Parse the input date string (already in YYYY-MM-DD format)
      const date = new Date(inputValue + 'T12:00:00');
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        onChange(inputValue);
      }
    } else {
      setSelectedDate(null);
      onChange("");
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="date"
          value={value || ""}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle calendar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
          <DayPicker
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            fromDate={minDate ? new Date(minDate + 'T12:00:00') : undefined}
            toDate={maxDate ? new Date(maxDate + 'T12:00:00') : undefined}
            styles={{
              caption: { color: '#3b82f6' },
              day: { margin: '0.2em' },
              day_selected: {
                backgroundColor: '#3b82f6',
                color: 'white',
              },
              day_today: { color: '#3b82f6', fontWeight: 'bold' },
            }}
          />
        </div>
      )}
    </div>
  );
};