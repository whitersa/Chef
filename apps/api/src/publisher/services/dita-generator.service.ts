/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { Recipe } from '@chefos/types';

@Injectable()
export class DitaGeneratorService {
  generateRecipeTopic(recipe: Recipe): string {
    const r = recipe as any;
    const doc = create({ version: '1.0', encoding: 'UTF-8' });
    doc.dtd({ pubID: '-//OASIS//DTD DITA Task//EN', sysID: 'task.dtd' });

    const root = doc.ele('task', { id: `recipe_${r.id}`, 'xml:lang': 'zh-CN' });

    root.ele('title').txt(r.name);

    if (r.variantName) {
      root.ele('shortdesc').txt(r.variantName);
    }

    const taskbody = root.ele('taskbody');

    // Ingredients as prerequisites
    if (r.items && r.items.length > 0) {
      const prereq = taskbody.ele('prereq');
      prereq.ele('p').txt('Ingredients:');
      const ul = prereq.ele('ul');

      r.items.forEach((item: any) => {
        const ingredientName = item.ingredient?.name || item.childRecipe?.name || 'Unknown Item';
        const text = `${item.quantity} ${item.ingredient?.unit || 'unit'} - ${ingredientName}`;
        ul.ele('li').txt(text);
      });
    }

    // Pre-processing as context
    if (r.preProcessing && r.preProcessing.length > 0) {
      const context = taskbody.ele('context');
      context.ele('p').txt('Preparation:');
      const ul = context.ele('ul');

      r.preProcessing.forEach((step: any) => {
        ul.ele('li').txt(`[${step.type}] ${step.description}`);
      });
    }

    // Steps
    if (r.steps && r.steps.length > 0) {
      const steps = taskbody.ele('steps');
      r.steps.forEach((stepText: any) => {
        steps.ele('step').ele('cmd').txt(stepText);
      });
    }

    return doc.end({ prettyPrint: true });
  }

  generateMap(recipes: Recipe[], title: string): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' });
    doc.dtd({ pubID: '-//OASIS//DTD DITA Map//EN', sysID: 'map.dtd' });

    const root = doc.ele('map', { 'xml:lang': 'zh-CN' });

    root.ele('title').txt(title);

    recipes.forEach((recipe) => {
      root.ele('topicref', { href: `recipe_${(recipe as any).id}.dita` });
    });

    return doc.end({ prettyPrint: true });
  }
}
