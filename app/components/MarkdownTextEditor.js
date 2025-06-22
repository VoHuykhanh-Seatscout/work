"use client";

export const MarkdownTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border rounded-lg min-h-[150px] focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
      <div className="text-xs text-gray-500">
        <p>Supports Markdown: **bold**, *italic*, - lists, [links](url)</p>
      </div>
    </div>
  );
};