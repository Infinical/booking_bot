import { Test, TestingModule } from '@nestjs/testing';
import { BookingFlowService } from './booking_flow.service';

describe('BookingFlowService', () => {
  let service: BookingFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingFlowService],
    }).compile();

    service = module.get<BookingFlowService>(BookingFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
