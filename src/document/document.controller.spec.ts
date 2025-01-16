import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../utils';
import { DocumentsController } from './document.controller';
import { DocumentsService } from './document.service';
import { CreateDocumentDto } from './dto/create.document.dto';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        fileType: 'pdf',
      };

      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as any;

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      } as any;

      const expectedResult = {
        id: '1',
        ...createDocumentDto,
        filePath: 'test.pdf',
        uploadedBy: mockUser,
      };

      mockDocumentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(
        createDocumentDto,
        mockFile,
        mockUser,
      );
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(
        createDocumentDto,
        mockFile,
        mockUser,
      );
    });
  });
});
