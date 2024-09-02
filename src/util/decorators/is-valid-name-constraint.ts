import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { MESSAGES } from 'src/constants/message.constant';

@ValidatorConstraint({ async: false })
export class IsValidNameConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return this.isValid(value);
  }

  private isValid(nickname: any): boolean {
    if (!nickname || nickname.trim().length === 0) {
      return false;
    }

    const forbiddenCharacters = /['",<>{}\[\]]/;
    if (forbiddenCharacters.test(nickname)) {
      return false;
    }

    if (nickname.toLowerCase().includes('admin')) {
      return false;
    }

    const trimmedNickname = nickname.trim();
    return nickname === trimmedNickname;
  }

  defaultMessage(args: ValidationArguments) {
    return MESSAGES.USER.COMMON.NAME.INVALID_FORMAT;
  }
}
