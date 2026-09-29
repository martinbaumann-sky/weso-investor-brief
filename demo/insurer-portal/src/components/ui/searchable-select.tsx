import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: React.ReactNode;
  searchText: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  triggerClassName?: string;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  emptyMessage = 'No results found',
  clearable = false,
  onClear,
  className,
  triggerClassName,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((o) => o.searchText.toLowerCase().includes(q));
  }, [options, search]);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setSearch('');
    setOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
    setSearch('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal h-10 px-3',
            triggerClassName
          )}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)} align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[260px] overflow-y-auto">
          {clearable && value && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          )}
          {filteredOptions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                disabled={option.disabled}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                  value === option.value && 'bg-accent text-accent-foreground',
                  !option.disabled && 'hover:bg-accent hover:text-accent-foreground',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
