import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSalesMenuDto } from './dto/create-sales-menu.dto';
import { UpdateSalesMenuDto } from './dto/update-sales-menu.dto';
import { SalesMenu } from './entities/sales-menu.entity';

@Injectable()
export class SalesMenusService {
  constructor(
    @InjectRepository(SalesMenu)
    private salesMenuRepository: Repository<SalesMenu>,
  ) {}

  create(createSalesMenuDto: CreateSalesMenuDto) {
    const menu = this.salesMenuRepository.create(createSalesMenuDto);
    return this.salesMenuRepository.save(menu);
  }

  findAll() {
    return this.salesMenuRepository.find({
      relations: ['items', 'items.recipe'],
    });
  }

  async findOne(id: string) {
    const menu = await this.salesMenuRepository.findOne({
      where: { id },
      relations: ['items', 'items.recipe'],
    });
    if (!menu) {
      throw new NotFoundException(`SalesMenu #${id} not found`);
    }
    return menu;
  }

  async update(id: string, updateSalesMenuDto: UpdateSalesMenuDto) {
    const menu = await this.salesMenuRepository.preload({
      id,
      ...updateSalesMenuDto,
    });
    if (!menu) {
      throw new NotFoundException(`SalesMenu #${id} not found`);
    }
    return this.salesMenuRepository.save(menu);
  }

  async remove(id: string) {
    const menu = await this.findOne(id);
    return this.salesMenuRepository.remove(menu);
  }
}
