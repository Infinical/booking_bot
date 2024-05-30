import { Module } from '@nestjs/common';
import { BookingFlowService } from './booking_flow.service';
import { BookingFlowController } from './booking_flow.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [BookingFlowController],
  providers: [BookingFlowService],
})
export class BookingFlowModule {}
