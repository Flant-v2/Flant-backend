import { PickType } from '@nestjs/swagger';
import { Report } from '../entities/report.entity';

export class CreateReportDto extends PickType(Report, ['type', 'content']) {}
