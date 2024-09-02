import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';

@ValidatorConstraint({ name: 'IsNotEmptyConstraint', async: true })
@Injectable()
export class IsNotEmptyConstraint implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    return this.isValid(value);
  }

  private isValid(value: any): boolean {
    return !(
      typeof value === 'undefined' ||
      value === null ||
      value === '' ||
      value === 'null' ||
      value.length === 0 ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'object' && !Object.keys(value).length)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return MESSAGES.CUSTOM_DECORATOR.IS_NOT_EMPTY;
  }
}
