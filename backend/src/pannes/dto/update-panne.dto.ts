import { PartialType } from '@nestjs/mapped-types';
import { CreatePanneDto } from './create-panne.dto';

export class UpdatePanneDto extends PartialType(CreatePanneDto) {}
