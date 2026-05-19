import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.wishlist.listPaintingIds(user.id).then((paintingIds) => ({
      paintingIds,
    }));
  }

  @Post('sync')
  sync(@CurrentUser() user: AuthUser, @Body() body: { paintingIds?: string[] }) {
    return this.wishlist.sync(user.id, body.paintingIds ?? []);
  }

  @Post(':paintingId')
  add(@CurrentUser() user: AuthUser, @Param('paintingId') paintingId: string) {
    return this.wishlist.add(user.id, paintingId);
  }

  @Delete(':paintingId')
  remove(@CurrentUser() user: AuthUser, @Param('paintingId') paintingId: string) {
    return this.wishlist.remove(user.id, paintingId);
  }
}
