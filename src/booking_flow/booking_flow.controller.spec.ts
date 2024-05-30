import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlowController } from './booking_flow.controller';
import { BookingFlowService } from './booking_flow.service';

describe('BookingFlowController', () => {
  let controller: BookingFlowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingFlowController],
      providers: [BookingFlowService],
    }).compile();

    controller = module.get<BookingFlowController>(BookingFlowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
