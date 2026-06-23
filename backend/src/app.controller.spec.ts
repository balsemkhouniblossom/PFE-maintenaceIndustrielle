import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return the API index payload', async () => {
      jest.spyOn(appService, 'getApiIndex').mockResolvedValue({
        message: 'GMAO API index',
        endpoints: [],
        entities: [],
        collections: [],
      });

      await expect(appController.getApiIndex()).resolves.toEqual({
        message: 'GMAO API index',
        endpoints: [],
        entities: [],
        collections: [],
      });
    });
  });
});
