import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MockupsModule } from './mockups/mockups.module';
import { BlogModule } from './blog/blog.module';
import { EventsModule } from './events/events.module';
import { PaintingsModule } from './paintings/paintings.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { StudioModule } from './studio/studio.module';
import { CommandeModule } from './commande/commande.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const synchronize =
          config.get<string>('DB_SYNCHRONIZE') === 'true' ||
          config.get<string>('NODE_ENV') !== 'production';

        const mysqlUrl =
          config.get<string>('MYSQL_URL') ||
          config.get<string>('DATABASE_URL');

        if (mysqlUrl) {
          return {
            type: 'mysql' as const,
            url: mysqlUrl,
            autoLoadEntities: true,
            synchronize,
          };
        }

        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USERNAME', 'root'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_DATABASE', 'mayn'),
          autoLoadEntities: true,
          synchronize,
        };
      },
    }),
    AuthModule,
    PaintingsModule,
    BlogModule,
    EventsModule,
    AdminModule,
    MockupsModule,
    WishlistModule,
    StudioModule,
    OrdersModule,
    CommandeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
