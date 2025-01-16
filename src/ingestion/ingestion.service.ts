import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { IngestionJob } from './entities/ingestion.job.entity';
import { CreateIngestionDto } from './dto/create.ingestion.dto';
import { UpdateIngestionDto } from './dto/update.ingestion.dto';
import { User } from '../users/entities/user.entity';
import { IngestionStatus } from '../utils';
import { firstValueFrom } from 'rxjs';
import { Document } from '../document/entities/document.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(IngestionJob)
    private ingestionRepository: Repository<IngestionJob>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private httpService: HttpService,
  ) {}

  async create(
    createIngestionDto: CreateIngestionDto,
    user: User,
  ): Promise<IngestionJob> {
    const document = await this.documentRepository.findOne({
      where: { id: createIngestionDto?.documentId } as any,
    });

    if (!document) {
      throw new NotFoundException(
        `Document with ID ${createIngestionDto?.documentId} not found`,
      );
    }

    const job = this.ingestionRepository.create({
      ...createIngestionDto,
      document,
      createdBy: user,
    });

    const savedJob = await this.ingestionRepository.save(job);
    this.processJob(savedJob);
    return savedJob;
  }

  async findAll(): Promise<IngestionJob[]> {
    return this.ingestionRepository.find();
  }

  async findOne(id: string): Promise<IngestionJob> {
    const job = await this.ingestionRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Ingestion job with ID ${id} not found`);
    }
    return job;
  }

  async update(
    id: string,
    updateIngestionDto: UpdateIngestionDto,
  ): Promise<IngestionJob> {
    const job = await this.findOne(id);

    if (job.status === IngestionStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed ingestion job');
    }

    Object.assign(job, updateIngestionDto);
    return this.ingestionRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.ingestionRepository.remove(job);
  }

  private async processJob(job: IngestionJob): Promise<void> {
    try {
      job.status = IngestionStatus?.PROCESSING;
      await this.ingestionRepository.save(job);

      // Call Python backend for processing
      const response: any = await firstValueFrom(
        this.httpService.post('http://python-backend/process', {
          jobId: job.id,
          documentId: job.document.id,
          type: job.type,
        }),
      );

      job.status = IngestionStatus?.COMPLETED;
      await this.ingestionRepository.save(job);

      // Notify callback URL about completion
      await firstValueFrom(
        this.httpService.post(job.callbackUrl, {
          jobId: job.id,
          status: IngestionStatus.COMPLETED,
          result: response.data,
        }),
      );
    } catch (error) {
      job.status = IngestionStatus.FAILED;
      job.error = error.message;
      await this.ingestionRepository.save(job);

      // Notify callback URL about failure
      await firstValueFrom(
        this.httpService.post(job.callbackUrl, {
          jobId: job.id,
          status: IngestionStatus.FAILED,
          error: error.message,
        }),
      ).catch(console.error);
    }
  }
}
