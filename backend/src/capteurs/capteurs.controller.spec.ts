import { Test, TestingModule } from '@nestjs/testing';
import { CapteursController } from './capteurs.controller';
import { CapteursService } from './capteurs.service';

describe('CapteursController', () => {
  let controller: CapteursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapteursController],
      providers: [
        {
          provide: CapteursService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CapteursController>(CapteursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
