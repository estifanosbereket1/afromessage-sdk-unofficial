import { AfroValidationError } from "../types/errors.js";

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function validatePhone(phone: string): void {
  if (!E164_REGEX.test(phone)) {
    throw new AfroValidationError(
      `Invalid phone number "${phone}". Expected E.164 format e.g. +251912345678`,
    );
  }
}

export function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new AfroValidationError(`"${fieldName}" must not be empty`);
  }
}
