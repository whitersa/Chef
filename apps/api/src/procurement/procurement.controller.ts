import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreateProcurementListDto } from './dto/create-procurement-list.dto';
import { ProcurementStatus } from './procurement.entity';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('generate')
  async generateList(
    @Body() createProcurementListDto: CreateProcurementListDto,
  ) {
    return this.procurementService.generateList(createProcurementListDto);
  }

  @Post()
  async create(@Body() createProcurementListDto: CreateProcurementListDto) {
    return this.procurementService.create(createProcurementListDto);
  }

  @Get()
  async findAll() {
    return this.procurementService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.procurementService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ProcurementStatus,
  ) {
    return this.procurementService.updateStatus(id, status);
  }
}
