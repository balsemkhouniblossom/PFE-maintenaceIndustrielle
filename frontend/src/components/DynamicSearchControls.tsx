import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ALL_FIELDS_TOKEN } from '@/services/dynamicSearch';

interface DynamicSearchControlsProps {
  selectedField: string;
  onSelectedFieldChange: (value: string) => void;
  searchableFields: string[];
  allFieldsLabel: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchPlaceholder: string;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
}

export default function DynamicSearchControls({
  selectedField,
  onSelectedFieldChange,
  searchableFields,
  allFieldsLabel,
  searchTerm,
  onSearchTermChange,
  searchPlaceholder,
  className = 'mt-4',
  selectClassName = 'input-field',
  inputClassName = 'input-field pl-10 w-full',
}: DynamicSearchControlsProps) {
  return (
    <div className={`${className} grid gap-3 md:grid-cols-[240px_1fr]`}>
      <select
        value={selectedField}
        onChange={(e) => onSelectedFieldChange(e.target.value)}
        aria-label={allFieldsLabel}
        title={allFieldsLabel}
        className={selectClassName}
      >
        <option value={ALL_FIELDS_TOKEN}>{allFieldsLabel}</option>
        {searchableFields.map((field) => (
          <option key={field} value={field}>
            {field.replace(/\./g, ' > ')}
          </option>
        ))}
      </select>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder={searchPlaceholder}
          title={searchPlaceholder}
          className={inputClassName}
        />
      </div>
    </div>
  );
}
