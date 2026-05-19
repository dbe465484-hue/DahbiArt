import { Module } from '@nestjs/common';
import { MockupsController } from './mockups.controller';
import { MockupsService } from './mockups.service';

@Module({
  controllers: [MockupsController],
  providers: [MockupsService],
  exports: [MockupsService],
})
export class MockupsModule {}
