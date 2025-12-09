import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from './menu.entity';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class MenusService implements OnModuleInit {
  constructor(
    @InjectRepository(Menu)
    private repo: Repository<Menu>,
  ) {}

  async onModuleInit() {
    console.log('MenusService: onModuleInit started');
    // Always sync in dev to pick up changes
    await this.sync();
    console.log('MenusService: onModuleInit completed');
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
    console.log('Current process.cwd():', process.cwd());

    const potentialPaths = [
      // Monorepo root structure
      path.join(process.cwd(), 'apps/api/src/menus/default-menus.json'),
      // Service root structure
      path.join(process.cwd(), 'src/menus/default-menus.json'),
      // Relative to current file (source)
      path.join(__dirname, '../../../../apps/api/src/menus/default-menus.json'),
      // Relative to current file (dist)
      path.join(__dirname, 'default-menus.json'),
    ];

    let menuData: any[] = [];
    let loadedPath = '';
    const debugInfo = {
      cwd: process.cwd(),
      checkedPaths: [] as string[],
      loadedPath: '',
      error: '',
      dataCount: 0,
    };

    for (const p of potentialPaths) {
      debugInfo.checkedPaths.push(p);
      if (await fs.pathExists(p)) {
        try {
          console.log(`Attempting to load menus from: ${p}`);
          menuData = await fs.readJSON(p);
          loadedPath = p;
          debugInfo.loadedPath = p;
          break;
        } catch (e: any) {
          console.error(`Error reading ${p}`, e);
          debugInfo.error = e.message;
        }
      }
    }

    if (!loadedPath) {
      console.error('Could not find default-menus.json in any expected location');
      return { status: 'failed', debugInfo };
    }

    console.log(`Successfully loaded menus from: ${loadedPath}`);
    console.log('Syncing menus with data count:', menuData.length);
    debugInfo.dataCount = menuData.length;

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

    return { status: 'success', debugInfo };
  }
}
