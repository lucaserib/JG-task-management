import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select items...',
  disabled = false,
}: MultiSelectProps) {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-auto min-h-[2.5rem]"
            disabled={disabled}
          >
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="mr-1"
                  >
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full" align="start">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
