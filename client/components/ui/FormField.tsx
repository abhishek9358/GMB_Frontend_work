import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ValidationError } from '../../utils/validation';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  errors?: ValidationError[];
  required?: boolean;
  help?: string;
  className?: string;
}

export function FormField({ label, children, errors = [], required = false, help, className = '' }: FormFieldProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}
      
      {help && !hasErrors && (
        <p className="text-xs text-gray-500">{help}</p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  errors?: ValidationError[];
}

export function FormInput({ errors = [], className = '', ...props }: FormInputProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
        hasErrors
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-gbp-blue-500 focus:border-gbp-blue-500'
      } ${className}`}
    />
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  errors?: ValidationError[];
}

export function FormTextarea({ errors = [], className = '', ...props }: FormTextareaProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical ${
        hasErrors
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-gbp-blue-500 focus:border-gbp-blue-500'
      } ${className}`}
    />
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  errors?: ValidationError[];
  children: React.ReactNode;
}

export function FormSelect({ errors = [], className = '', children, ...props }: FormSelectProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
        hasErrors
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-gbp-blue-500 focus:border-gbp-blue-500'
      } ${className}`}
    >
      {children}
    </select>
  );
}

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: ValidationError[];
}

export function FormCheckbox({ label, errors = [], className = '', ...props }: FormCheckboxProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        {...props}
        className={`w-4 h-4 rounded focus:ring-2 transition-colors ${
          hasErrors
            ? 'border-red-300 text-red-600 focus:ring-red-500'
            : 'border-gray-300 text-gbp-blue-600 focus:ring-gbp-blue-500'
        } ${className}`}
      />
      <label className={`text-sm cursor-pointer ${hasErrors ? 'text-red-700' : 'text-gray-700'}`}>
        {label}
      </label>
    </div>
  );
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  title?: string;
}

export function ValidationSummary({ errors, title = 'Please fix the following errors:' }: ValidationSummaryProps) {
  if (errors.length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
      </div>
      <ul className="space-y-1 text-sm text-red-700">
        {errors.map((error, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
            <span>{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
