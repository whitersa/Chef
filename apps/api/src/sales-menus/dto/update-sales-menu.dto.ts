import { PartialType } from '@nestjs/swagger';
import { CreateSalesMenuDto } from './create-sales-menu.dto';

export class UpdateSalesMenuDto extends PartialType(CreateSalesMenuDto) {}
