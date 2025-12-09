import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { Recipe } from '@chefos/types';

@Injectable()
export class DitaGeneratorService {
  generateRecipeTopic(recipe: Recipe): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('task', { id: `recipe_${recipe.id}` })
      .dtd({ pubID: '-//OASIS//DTD DITA Task//EN', sysID: 'task.dtd' })
      .up();

    root.ele('title').txt(recipe.name).up();

    if (recipe.variantName) {
      root.ele('shortdesc').txt(recipe.variantName).up();
    }

    const taskbody = root.ele('taskbody');

    // Ingredients as prerequisites
    if (recipe.items && recipe.items.length > 0) {
      const prereq = taskbody.ele('prereq');
      prereq.ele('p').txt('Ingredients:').up();
      const ul = prereq.ele('ul');

      recipe.items.forEach((item) => {
        const ingredientName = item.ingredient?.name || item.childRecipe?.name || 'Unknown Item';
        const text = `${item.quantity} ${item.ingredient?.unit || 'unit'} - ${ingredientName}`;
        ul.ele('li').txt(text).up();
      });
      prereq.up();
    }

    // Pre-processing as context
    if (recipe.preProcessing && recipe.preProcessing.length > 0) {
      const context = taskbody.ele('context');
      context.ele('p').txt('Preparation:').up();
      const ul = context.ele('ul');

      recipe.preProcessing.forEach((step) => {
        ul.ele('li').txt(`[${step.type}] ${step.description}`).up();
      });
      context.up();
    }

    // Steps
    if (recipe.steps && recipe.steps.length > 0) {
      const steps = taskbody.ele('steps');
      recipe.steps.forEach((stepText) => {
        steps.ele('step').ele('cmd').txt(stepText).up().up();
      });
      steps.up();
    }

    return root.end({ prettyPrint: true });
  }

  generateMap(recipes: Recipe[], title: string): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('map')
      .dtd({ pubID: '-//OASIS//DTD DITA Map//EN', sysID: 'map.dtd' })
      .up();

    root.ele('title').txt(title).up();

    recipes.forEach((recipe) => {
      root.ele('topicref', { href: `recipe_${recipe.id}.dita` }).up();
    });

    return root.end({ prettyPrint: true });
  }
}
