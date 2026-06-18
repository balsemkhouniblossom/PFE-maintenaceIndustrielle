import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleTypeDto } from './create-module-type.dto';

export class UpdateModuleTypeDto extends PartialType(CreateModuleTypeDto) {}