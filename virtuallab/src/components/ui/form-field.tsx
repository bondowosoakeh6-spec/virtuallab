"use client";

/**
 * Form Field Components with UX Enhancements
 * Feature #78: Form UX
 *
 * Numeric input dengan unit label, validation, helper text,
 * tooltip, dan formula explanation.
 */

import React, { useState, useId } from "react";
import { Info, AlertCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================================
// FormField — Wrapper with label, input, helper text, error
// ============================================================
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  tooltip,
  children,
  className = "",
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor={fieldId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5" aria-label="wajib diisi">*</span>}
        </Label>
        {tooltip && <FormulaTooltip content={tooltip} />}
      </div>

      {/* Input */}
      {children}

      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="flex items-start gap-1.5 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs text-rose-600" role="alert">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// NumericInput — Number input with unit label
// ============================================================
interface NumericInputProps {
  id?: string;
  name?: string;
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  unit?: string;
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  decimals?: number;
  disabled?: boolean;
  className?: string;
}

export function NumericInput({
  id,
  name,
  label,
  value,
  onChange,
  unit,
  placeholder = "0.00",
  helperText,
  tooltip,
  error,
  required = false,
  min,
  max,
  step = "any",
  disabled = false,
  className = "",
}: NumericInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    helperText && !error ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      helperText={helperText}
      tooltip={tooltip}
      className={className}
    >
      <div className="relative flex items-center">
        <Input
          id={inputId}
          name={name}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`
            pr-${unit ? '14' : '3'} h-10 text-sm font-mono
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
            ${error ? 'border-rose-400 focus-visible:outline-rose-500' : 'border-slate-300'}
            ${disabled ? 'bg-slate-50 text-slate-400' : ''}
          `}
        />
        {unit && (
          <span
            className="absolute right-3 text-sm font-medium text-slate-400 pointer-events-none select-none"
            aria-hidden="true"
          >
            {unit}
          </span>
        )}
      </div>
    </FormField>
  );
}

// ============================================================
// FormulaTooltip — Hover/click tooltip for formula explanation
// ============================================================
interface FormulaTooltipProps {
  content: string;
  formula?: string;
}

export function FormulaTooltip({ content, formula }: FormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="
          inline-flex items-center justify-center
          w-4 h-4 rounded-full text-slate-400
          hover:text-blue-600 hover:bg-blue-50
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          transition-colors
        "
        aria-label="Informasi tambahan"
        aria-describedby={isOpen ? tooltipId : undefined}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onBlur={() => setIsOpen(false)}
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className="
            absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2
            w-64 max-w-xs p-3 rounded-lg shadow-lg
            bg-slate-900 text-white text-xs leading-relaxed
            animate-in fade-in-0 zoom-in-95
          "
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
          <p>{content}</p>
          {formula && (
            <p className="mt-1.5 font-mono text-blue-300 bg-slate-800 rounded px-2 py-1">
              {formula}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TextInput — Text input with form field wrapper
// ============================================================
interface TextInputProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  className?: string;
}

export function TextInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  tooltip,
  error,
  required = false,
  disabled = false,
  type = "text",
  className = "",
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      helperText={helperText}
      tooltip={tooltip}
      className={className}
    >
      <Input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`
          h-10 text-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          ${error ? 'border-rose-400 focus-visible:outline-rose-500' : 'border-slate-300'}
          ${disabled ? 'bg-slate-50 text-slate-400' : ''}
        `}
      />
    </FormField>
  );
}

// ============================================================
// SelectField — Select with form field wrapper
// ============================================================
interface SelectFieldProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  helperText,
  tooltip,
  error,
  required = false,
  disabled = false,
  className = "",
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      error={error}
      helperText={helperText}
      tooltip={tooltip}
      className={className}
    >
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={`
          w-full h-10 rounded-md border bg-white px-3 py-2 text-sm
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          ${error ? 'border-rose-400' : 'border-slate-300'}
          ${disabled ? 'bg-slate-50 text-slate-400' : ''}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
