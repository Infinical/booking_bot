import { Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { BookingFlowService } from './booking_flow.service';

@Controller('booking-flow')
export class BookingFlowController {
  constructor(private readonly bookingFlowService: BookingFlowService) {}

  @Get('/webhooks')
  getWebhooks() {
    return this.bookingFlowService.getWebhooks();
  }

  @Delete('/webhooks/:id')
  deleteWebhook(@Param('id') id: string) {
    return this.bookingFlowService.deleteWebhook(id);
  }

  @Post('/webhook')
  createWebhook() {
    return this.bookingFlowService.createWebhook();
  }

  @Post('create-webhook')
  startWebhook(@Req() request: Request, @Res() resp: Response) {
    return this.bookingFlowService.startWebhook(request, resp);
  }
}
