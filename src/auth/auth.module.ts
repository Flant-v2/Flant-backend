import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { configModuleGoogleValidationSchema } from './../configs/google-env-validation.config';
import { Refreshtoken } from './entities/refresh-token.entity';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-token.strategy';
import { Cart } from 'src/cart/entities/cart.entity';
import { Merchandise } from 'src/merchandise/entities/merchandise.entity';
import { MerchandiseOption } from 'src/merchandise/entities/marchandise-option.entity';
import { CartItem } from 'src/cart/entities/cart.item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleGoogleValidationSchema,
    }),
    TypeOrmModule.forFeature([
      User,
      Refreshtoken,
      Cart,
      CartItem,
      Merchandise,
      MerchandiseOption,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    JwtRefreshStrategy,
  ],
  exports: [TypeOrmModule.forFeature([User])],
})
export class AuthModule {}
