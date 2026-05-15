import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const Select = ({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select...",
  id,
  name,
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const listboxId = `${id ?? "select"}-listbox`;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onBlur]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const openDropdown = () => {
    if (disabled) return;
    const currentIdx = options.findIndex((o) => o.value === value);
    setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0) selectOption(options[highlightedIndex].value);
        } else {
          openDropdown();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      case "Escape":
        if (isOpen) {
          e.stopPropagation();
          closeDropdown();
          onBlur?.();
        }
        break;
      case "Tab":
        if (isOpen) {
          closeDropdown();
          onBlur?.();
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={name}
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            closeDropdown();
            onBlur?.();
          }
        }}
        className={[
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-surface",
          "border rounded-lg text-sm text-left outline-none transition-colors duration-150",
          disabled
            ? "opacity-50 cursor-not-allowed border-border"
            : "cursor-pointer border-border hover:border-ink-muted",
          isOpen ? "border-accent ring-2 ring-accent-light" : "",
          value ? "text-ink-primary" : "text-ink-muted",
        ].join(" ")}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <svg
          className={`h-4 w-4 text-ink-muted shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-lg shadow-dropdown py-1 max-h-56 overflow-y-auto"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option.value);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={[
                  "px-3.5 py-2.5 text-sm cursor-pointer select-none transition-colors duration-100",
                  isSelected
                    ? "text-accent font-medium bg-accent-light"
                    : isHighlighted
                    ? "bg-surface-alt text-ink-primary"
                    : "text-ink-primary",
                ].join(" ")}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
