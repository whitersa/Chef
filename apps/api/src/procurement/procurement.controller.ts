import { Controller, Post, Body } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementListDto } from './dto/create-procurement-list.dto';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('generate')
  async generateList(
    @Body() createProcurementListDto: CreateProcurementListDto,
  ) {
    return this.procurementService.generateList(createProcurementListDto);
  }
}
