import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CapteursService } from './capteurs.service';
import { Capteur } from '../schemas/capteur.schema';

describe('CapteursService', () => {
  let service: CapteursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapteursService,
        {
          provide: getModelToken(Capteur.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CapteursService>(CapteursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
