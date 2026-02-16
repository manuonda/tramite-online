/**
 * Custom Validators
 * Reusable form validators
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Email validator with more strict pattern
 */
export function emailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const valid = emailRegex.test(control.value);
    return valid ? null : { invalidEmail: true };
  };
}

/**
 * Password strength validator
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors['requiresUppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['requiresLowercase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['requiresNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Password match validator for confirm password fields
 */
export function passwordMatchValidator(passwordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const password = control.parent.get(passwordField)?.value;
    const confirmPassword = control.value;

    if (!confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

/**
 * URL validator
 */
export function urlValidator(): ValidatorFn {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const valid = urlRegex.test(control.value);
    return valid ? null : { invalidUrl: true };
  };
}

/**
 * Phone number validator (international format)
 */
export function phoneValidator(): ValidatorFn {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const valid = phoneRegex.test(control.value);
    return valid ? null : { invalidPhone: true };
  };
}

/**
 * Whitespace validator (no whitespace allowed)
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const hasWhitespace = /\s/.test(control.value);
    return hasWhitespace ? { whitespace: true } : null;
  };
}

/**
 * Number range validator
 */
export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value && control.value !== 0) {
      return null;
    }

    const value = Number(control.value);

    if (isNaN(value)) {
      return { invalidNumber: true };
    }

    if (value < min || value > max) {
      return { range: { min, max, actual: value } };
    }

    return null;
  };
}

/**
 * File size validator (in bytes)
 */
export function fileSizeValidator(maxSize: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const file = control.value as File;

    if (file.size > maxSize) {
      return { fileSize: { maxSize, actualSize: file.size } };
    }

    return null;
  };
}

/**
 * File type validator
 */
export function fileTypeValidator(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const file = control.value as File;
    const fileType = file.type;

    if (!allowedTypes.includes(fileType)) {
      return { fileType: { allowedTypes, actualType: fileType } };
    }

    return null;
  };
}
