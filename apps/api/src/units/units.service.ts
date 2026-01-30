import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './unit.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitsService implements OnModuleInit {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async onModuleInit() {
    console.log('UnitsService: onModuleInit started');
    const count = await this.unitsRepository.count();
    if (count === 0) {
      await this.seed();
    }
    console.log('UnitsService: onModuleInit completed');
  }

  async seed() {
    const defaultUnits = [
      { name: '千克', abbreviation: 'kg', description: '质量单位' },
      { name: '克', abbreviation: 'g', description: '质量单位' },
      { name: '升', abbreviation: 'L', description: '体积单位' },
      { name: '毫升', abbreviation: 'ml', description: '体积单位' },
      { name: '个', abbreviation: 'pcs', description: '数量单位' },
      { name: '份', abbreviation: 'portion', description: '数量单位' },
      { name: '勺', abbreviation: 'tbsp', description: '体积单位' },
    ];

    for (const unit of defaultUnits) {
      await this.unitsRepository.save(this.unitsRepository.create(unit));
    }
  }

  create(createUnitDto: CreateUnitDto) {
    const unit = this.unitsRepository.create(createUnitDto);
    return this.unitsRepository.save(unit);
  }

  findAll() {
    return this.unitsRepository.find({
      order: { name: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.unitsRepository.findOneBy({ id });
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    await this.unitsRepository.update(id, updateUnitDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.unitsRepository.softDelete(id);
  }
}
