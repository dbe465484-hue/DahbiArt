import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  createSession(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.checkout.createSession(user.id, dto);
  }

  @Post('confirm-dev/:orderId')
  @UseGuards(JwtAuthGuard)
  confirmDev(
    @CurrentUser() user: { id: string },
    @Param('orderId') orderId: string,
  ) {
    return this.checkout.confirmDevPayment(orderId, user.id);
  }

  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = req.rawBody;
    if (!raw || !signature) {
      return { received: false };
    }
    return this.checkout.handleWebhook(raw, signature);
  }
}
