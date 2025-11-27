import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from './menu.entity';
import * as defaultMenus from './default-menus.json';

@Injectable()
export class MenusService implements OnModuleInit {
  constructor(
    @InjectRepository(Menu)
    private repo: Repository<Menu>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.seed();
    }
  }

  async seed() {
    await this.sync();
  }

  async findAll() {
    // Fetch all roots
    const roots = await this.repo.find({
      where: { parent: IsNull() },
      relations: ['children'],
      order: { order: 'ASC' },
    });

    // Sort children
    roots.forEach((root) => {
      if (root.children) {
        root.children.sort((a, b) => a.order - b.order);
      }
    });

    return roots;
  }

  async sync() {
    const menuData = defaultMenus as any[];

    // Clear existing menus
    const allMenus = await this.repo.find();
    await this.repo.remove(allMenus);

    // Re-create
    for (const rootData of menuData) {
      const { children, ...rootFields } = rootData as {
        children: any[];
        [key: string]: any;
      };
      const root = await this.repo.save(rootFields);

      if (children && children.length > 0) {
        const childrenEntities = children.map(
          (c) =>
            ({
              ...c,
              parent: root,
            }) as Menu,
        );
        await this.repo.save(childrenEntities);
      }
    }
  }
}
