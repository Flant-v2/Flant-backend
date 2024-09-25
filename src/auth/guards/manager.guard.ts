// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   NotFoundException,
// } from '@nestjs/common';
// import { MESSAGES } from 'src/constants/message.constant';
// import _ from 'lodash';

// @Injectable()
// export class ManagerGuard implements CanActivate {
//   constructor(private readonly managerService: AdminManagerService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const userId = request.user?.id;

//     if (!userId) {
//       throw new NotFoundException(MESSAGES.AUTH.COMMON.COMMUNITY_USER.NO_USER);
//     }

//     //await this.managerService.findByUserId(userId);

//     return true;
//   }
// }
