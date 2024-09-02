import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationSchema } from './configs/env-validation.config';
import { typeOrmModuleOptions } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MerchandiseModule } from './merchandise/merchandise.module';
import { FormModule } from './form/form.module';
import { CommunityModule } from './community/community.module';
import { AdminModule } from './admin/admin.module';
import { MembershipModule } from './membership/membership.module';
import { CommentModule } from './comment/comment.module'; // CommentModule 추가
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './chat/chat.module';
import { CartModule } from './cart/cart.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PostModule } from './post/post.module';
import { LikeModule } from './like/like.module';
import { NoticeModule } from './notice/notice.module';
import { MediaModule } from './media/media.module';
import { LiveModule } from './live/live.module';
import { CommunityUserModule } from './community/community-user/community-user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryWebhookInterceptor } from './webhook.interceptor';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'final_project_frontend'),
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      password: process.env.REDIS_PASSWORD,
      socket: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST,
      },
      isGlobal: true,
      ttl: 180 * 1000,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    // ProductModule,
    OrderModule,
    AuthModule,
    UserModule,
    MerchandiseModule,
    FormModule,
    CommunityModule,
    AdminModule,
    MembershipModule,
    CommentModule, // CommentModule 추가
    CartModule,
    PostModule,
    LikeModule,
    NoticeModule,
    MediaModule,
    PostModule,
    LiveModule,
    CommunityUserModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // sentry가 전역에 사용될수있도록 설정
      provide: APP_INTERCEPTOR,
      useClass: SentryWebhookInterceptor,
    },
  ],
})
export class AppModule {}
