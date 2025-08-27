// Validation utilities for GMB profile forms

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Phone number validation regex (international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Time validation regex (HH:MM format)
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export class ProfileValidator {
  private errors: ValidationError[] = [];

  // Reset errors for new validation
  reset(): void {
    this.errors = [];
  }

  // Add an error
  private addError(field: string, message: string, type: ValidationError['type'] = 'custom'): void {
    this.errors.push({ field, message, type });
  }

  // Get all errors
  getErrors(): ValidationError[] {
    return this.errors;
  }

  // Check if validation passed
  isValid(): boolean {
    return this.errors.length === 0;
  }

  // Get validation result
  getResult(): ValidationResult {
    return {
      isValid: this.isValid(),
      errors: this.getErrors()
    };
  }

  // Validate required fields
  validateRequired(value: any, fieldName: string, displayName?: string): boolean {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.addError(fieldName, `${displayName || fieldName} is required`, 'required');
      return false;
    }
    return true;
  }

  // Validate string length
  validateLength(value: string, fieldName: string, min?: number, max?: number, displayName?: string): boolean {
    const name = displayName || fieldName;
    
    if (min !== undefined && value.length < min) {
      this.addError(fieldName, `${name} must be at least ${min} characters long`, 'length');
      return false;
    }
    
    if (max !== undefined && value.length > max) {
      this.addError(fieldName, `${name} cannot exceed ${max} characters`, 'length');
      return false;
    }
    
    return true;
  }

  // Validate URL format
  validateUrl(url: string, fieldName: string, displayName?: string): boolean {
    if (url && !URL_REGEX.test(url)) {
      this.addError(fieldName, `${displayName || fieldName} must be a valid URL (starting with http:// or https://)`, 'format');
      return false;
    }
    return true;
  }

  // Validate phone number format
  validatePhone(phone: string, fieldName: string, displayName?: string): boolean {
    if (phone && !PHONE_REGEX.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      this.addError(fieldName, `${displayName || fieldName} must be a valid phone number`, 'format');
      return false;
    }
    return true;
  }

  // Validate email format
  validateEmail(email: string, fieldName: string, displayName?: string): boolean {
    if (email && !EMAIL_REGEX.test(email)) {
      this.addError(fieldName, `${displayName || fieldName} must be a valid email address`, 'format');
      return false;
    }
    return true;
  }

  // Validate time format
  validateTime(time: string, fieldName: string, displayName?: string): boolean {
    if (time && !TIME_REGEX.test(time)) {
      this.addError(fieldName, `${displayName || fieldName} must be in HH:MM format`, 'format');
      return false;
    }
    return true;
  }

  // Validate coordinates
  validateCoordinates(lat: number, lng: number): boolean {
    let isValid = true;
    
    if (lat < -90 || lat > 90) {
      this.addError('latitude', 'Latitude must be between -90 and 90 degrees', 'format');
      isValid = false;
    }
    
    if (lng < -180 || lng > 180) {
      this.addError('longitude', 'Longitude must be between -180 and 180 degrees', 'format');
      isValid = false;
    }
    
    return isValid;
  }

  // Validate postal code format (basic validation)
  validatePostalCode(postalCode: string, countryCode: string, fieldName: string = 'postalCode'): boolean {
    if (!postalCode) return true; // Optional field
    
    // Basic validation patterns for common countries
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'IN': /^\d{6}$/,
      'GB': /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
      'CA': /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i,
      'AU': /^\d{4}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'JP': /^\d{3}-\d{4}$/,
    };
    
    const pattern = patterns[countryCode];
    if (pattern && !pattern.test(postalCode)) {
      this.addError(fieldName, `Postal code format is invalid for ${countryCode}`, 'format');
      return false;
    }
    
    return true;
  }

  // Validate business hours
  validateBusinessHours(openTime: string, closeTime: string, day: string): boolean {
    let isValid = true;
    
    if (!this.validateTime(openTime, `${day}_open`, `${day} opening time`)) {
      isValid = false;
    }
    
    if (!this.validateTime(closeTime, `${day}_close`, `${day} closing time`)) {
      isValid = false;
    }
    
    // Check if opening time is before closing time (same day)
    if (openTime && closeTime && openTime >= closeTime) {
      this.addError(`${day}_hours`, `${day} opening time must be before closing time`, 'custom');
      isValid = false;
    }
    
    return isValid;
  }

  // Validate category selection
  validateCategories(categories: Array<{ displayName: string; primary?: boolean }>): boolean {
    let isValid = true;
    
    if (categories.length === 0) {
      this.addError('categories', 'At least one business category is required', 'required');
      isValid = false;
    }
    
    const primaryCategories = categories.filter(cat => cat.primary);
    if (primaryCategories.length === 0) {
      this.addError('primaryCategory', 'A primary business category is required', 'required');
      isValid = false;
    } else if (primaryCategories.length > 1) {
      this.addError('primaryCategory', 'Only one primary category is allowed', 'custom');
      isValid = false;
    }
    
    return isValid;
  }
}

// Convenience function for quick validation
export function validateBusinessProfile(profile: any): ValidationResult {
  const validator = new ProfileValidator();
  
  // Validate basic info
  validator.validateRequired(profile.basicInfo?.title, 'title', 'Business name');
  
  if (profile.basicInfo?.title) {
    validator.validateLength(profile.basicInfo.title, 'title', 1, 100, 'Business name');
  }
  
  if (profile.basicInfo?.description) {
    validator.validateLength(profile.basicInfo.description, 'description', 0, 750, 'Description');
  }
  
  // Validate categories
  if (profile.basicInfo?.categories) {
    validator.validateCategories(profile.basicInfo.categories);
  }
  
  // Validate contact info
  if (profile.contact?.phoneNumbers) {
    profile.contact.phoneNumbers.forEach((phone: any, index: number) => {
      if (phone.phoneNumber) {
        validator.validatePhone(phone.phoneNumber, `phone_${index}`, `Phone number ${index + 1}`);
      }
    });
  }
  
  if (profile.contact?.websiteUri) {
    validator.validateUrl(profile.contact.websiteUri, 'website', 'Website URL');
  }
  
  if (profile.contact?.chatUrl) {
    validator.validateUrl(profile.contact.chatUrl, 'chatUrl', 'Chat URL');
  }
  
  // Validate location
  if (profile.location?.storefrontAddress) {
    const address = profile.location.storefrontAddress;
    
    if (address.postalCode && address.regionCode) {
      validator.validatePostalCode(address.postalCode, address.regionCode);
    }
  }
  
  if (profile.location?.coordinates) {
    const { latitude, longitude } = profile.location.coordinates;
    if (latitude !== undefined && longitude !== undefined) {
      validator.validateCoordinates(latitude, longitude);
    }
  }
  
  // Validate business hours
  if (profile.hours?.regularHours?.periods) {
    profile.hours.regularHours.periods.forEach((period: any) => {
      if (period.openTime && period.closeTime) {
        validator.validateBusinessHours(period.openTime, period.closeTime, period.openDay);
      }
    });
  }
  
  return validator.getResult();
}

// Get user-friendly error messages
export function getErrorMessage(error: ValidationError): string {
  return error.message;
}

// Group errors by field
export function groupErrorsByField(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((groups, error) => {
    if (!groups[error.field]) {
      groups[error.field] = [];
    }
    groups[error.field].push(error);
    return groups;
  }, {} as Record<string, ValidationError[]>);
}

// Check if a specific field has errors
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(error => error.field === fieldName);
}

// Get errors for a specific field
export function getFieldErrors(errors: ValidationError[], fieldName: string): ValidationError[] {
  return errors.filter(error => error.field === fieldName);
}
