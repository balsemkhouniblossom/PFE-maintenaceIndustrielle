import { PartialType } from '@nestjs/mapped-types';
import { CreateCapteurDto } from './create-capteur.dto';

export class UpdateCapteurDto extends PartialType(CreateCapteurDto) {}
