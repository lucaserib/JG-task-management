import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidDateFormat', async: false })
export class IsValidDateFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return true;

    if (typeof value === 'string') {
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

      if (!dateOnlyRegex.test(value) && !isoDateRegex.test(value)) {
        return false;
      }

      const date = new Date(value);
      return !isNaN(date.getTime());
    }

    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date must be in format YYYY-MM-DD or ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)';
  }
}

export function IsValidDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateFormatConstraint,
    });
  };
}
