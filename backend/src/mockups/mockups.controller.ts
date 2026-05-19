import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { MockupsService } from './mockups.service';

@Controller('mockups')
export class MockupsController {
  constructor(private readonly mockups: MockupsService) {}

  @Get()
  list() {
    return this.mockups.list();
  }

  @Get('render')
  async render(
    @Query('paintingUrl') paintingUrl: string,
    @Query('mockupId') mockupId: string,
    @Query('width') width: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.mockups.render(
      paintingUrl,
      mockupId,
      Number(width) || 1920,
    );
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    });
    return new StreamableFile(buffer);
  }
}
