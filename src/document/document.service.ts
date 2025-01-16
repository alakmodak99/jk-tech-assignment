import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create.document.dto';
import { UpdateDocumentDto } from './dto/update.document.dto';
import { FileUploadService } from './file.upload.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: any,
    user: User,
  ): Promise<Document> {
    try {
      const fileName = await this.fileUploadService.uploadFile(file);

      const document = this.documentsRepository.create({
        ...createDocumentDto,
        filePath: fileName,
        fileSize: file.size,
        uploadedBy: user,
      });

      return this.documentsRepository.save(document);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Document[]> {
    try {
      return this.documentsRepository.find();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Document> {
    try {
      const document = await this.documentsRepository.findOne({
        where: { id },
      });
      if (!document)
        throw new NotFoundException(`Document with ID ${id} not found`);
      return document;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    file?: any,
  ): Promise<Document> {
    try {
      const document = await this.findOne(id);
      if (!document)
        throw new NotFoundException(`Document with ID ${id} not found`);

      if (file) {
        await this.fileUploadService.deleteFile(document.filePath);
        const fileName = await this.fileUploadService.uploadFile(file);
        document.filePath = fileName;
        document.fileSize = file.size;
      }

      Object.assign(document, updateDocumentDto);
      return this.documentsRepository.save(document);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const document = await this.findOne(id);
      if (!document)
        throw new NotFoundException(`Document with ID ${id} not found`);

      await this.fileUploadService.deleteFile(document?.filePath || '');
      await this.documentsRepository.remove(document);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
