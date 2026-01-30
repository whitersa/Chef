import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateSalesMenuDto } from './dto/create-sales-menu.dto';
import { UpdateSalesMenuDto } from './dto/update-sales-menu.dto';
import { SalesMenu } from './entities/sales-menu.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

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

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, sort, order = 'ASC' } = query;
    const skip = (page - 1) * limit;

    const orderOption: Record<string, 'ASC' | 'DESC'> = {};
    if (sort) {
      if (sort.includes(':') || sort.includes(',')) {
        const sortFields = sort.split(',');
        sortFields.forEach((fieldStr) => {
          const [field, fieldOrder] = fieldStr.split(':');
          if (field) {
            orderOption[field.trim()] = fieldOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          }
        });
      } else {
        orderOption[sort] = order;
      }
    } else {
      orderOption['name'] = 'ASC';
    }

    const [items, total] = await this.salesMenuRepository.findAndCount({
      where: search ? { name: Like(`%${search}%`) } : {},
      relations: ['items', 'items.recipe'],
      skip,
      take: limit,
      order: orderOption,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
