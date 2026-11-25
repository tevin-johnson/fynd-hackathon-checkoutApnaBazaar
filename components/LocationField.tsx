'use client';

import { useId, useState } from 'react';
import { formatLocation, resolveLocation, searchLocations } from '@/lib/locations';

/**
 * Accessible city autocomplete (WAI-ARIA 1.2 combobox + listbox pattern).
 * - Typing lists matching cities from a bundled list (no network calls).
 * - ↑/↓ move through suggestions, Enter picks, Escape closes; click/tap also picks.
 * - Typing an exact city name and leaving the field auto-fills "City, State".
 */
export default function LocationField({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const suggestions = searchLocations(value);
  const showList = open && suggestions.length > 0;

  const choose = (text: string) => {
    onChange(text);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
    } else if (e.key === 'Enter' && showList && active >= 0) {
      e.preventDefault(); // pick the suggestion instead of submitting the form
      const picked = suggestions[active];
      if (picked) choose(formatLocation(picked));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="combo">
      <input
        id="customer-location"
        className="form__input"
        name="location"
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={value}
        placeholder="Start typing, e.g. Pune"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
          // Auto-fill: an exact city name becomes its canonical "City, State".
          const match = resolveLocation(value);
          if (match) onChange(formatLocation(match));
        }}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching cities"
        className="combo__list"
        hidden={!showList}
      >
        {suggestions.map((loc, i) => (
          <li
            key={formatLocation(loc)}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            className={`combo__option${i === active ? ' combo__option--active' : ''}`}
            // mousedown (not click) so the input's blur doesn't close the list first
            onMouseDown={(e) => {
              e.preventDefault();
              choose(formatLocation(loc));
            }}
            onMouseEnter={() => setActive(i)}
          >
            <span className="combo__city">{loc.city}</span>
            <span className="combo__state">{loc.state}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
