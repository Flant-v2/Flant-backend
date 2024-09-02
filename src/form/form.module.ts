import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { Form } from './entities/form.entity';
import { ApplyUser } from './entities/apply-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Manager } from 'src/admin/entities/manager.entity';
import { Community } from 'src/community/entities/community.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommunityUserModule } from 'src/community/community-user/community-user.module';
import { AdminModule } from 'src/admin/admin.module';
import { FormQuestion } from './entities/form-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Form,
      FormQuestion,
      ApplyUser,
      User,
      Manager,
      Community,
    ]),
    CommunityUserModule,
    AdminModule,
  ],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
