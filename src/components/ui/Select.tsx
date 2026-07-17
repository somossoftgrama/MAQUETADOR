interface SelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
}: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
