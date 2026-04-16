interface InputCardProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function InputCard({
  value,
  onChange,
  placeholder = "Paste your article text here...",
  disabled = false,
}: InputCardProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        Your Article Text
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={8}
        disabled={disabled}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
      />
      <p className="text-xs text-gray-500 mt-2">
        Paste the full text of your article or blog post above.
      </p>
    </div>
  );
}
