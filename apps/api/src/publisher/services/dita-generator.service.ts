import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { Recipe } from '@chefos/types';

@Injectable()
export class DitaGeneratorService {
  generateRecipeTopic(recipe: Recipe): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' });
    doc.dtd({ pubID: '-//OASIS//DTD DITA Task//EN', sysID: 'task.dtd' });

    const root = doc.ele('task', { id: `recipe_${recipe.id}`, 'xml:lang': 'zh-CN' });

    root.ele('title').txt(recipe.name);

    if (recipe.variantName) {
      root.ele('shortdesc').txt(recipe.variantName);
    }

    const taskbody = root.ele('taskbody');

    // Ingredients as prerequisites
    if (recipe.items && recipe.items.length > 0) {
      const prereq = taskbody.ele('prereq');
      prereq.ele('p').txt('Ingredients:');
      const ul = prereq.ele('ul');

      recipe.items.forEach((item) => {
        const ingredientName = item.ingredient?.name || item.childRecipe?.name || 'Unknown Item';
        const text = `${item.quantity} ${item.ingredient?.unit || 'unit'} - ${ingredientName}`;
        ul.ele('li').txt(text);
      });
    }

    // Pre-processing as context
    if (recipe.preProcessing && recipe.preProcessing.length > 0) {
      const context = taskbody.ele('context');
      context.ele('p').txt('Preparation:');
      const ul = context.ele('ul');

      recipe.preProcessing.forEach((step) => {
        ul.ele('li').txt(`[${step.type}] ${step.description}`);
      });
    }

    // Steps
    if (recipe.steps && recipe.steps.length > 0) {
      const steps = taskbody.ele('steps');
      recipe.steps.forEach((stepText) => {
        steps.ele('step').ele('cmd').txt(stepText);
      });
    }

    return doc.end({ prettyPrint: true });
  }

  generateBookMap(chapters: { title: string; recipes: Recipe[] }[], title: string): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' });
    doc.dtd({ pubID: '-//OASIS//DTD DITA BookMap//EN', sysID: 'bookmap.dtd' });

    const root = doc.ele('bookmap', { 'xml:lang': 'zh-CN' });

    const bookTitle = root.ele('booktitle');
    bookTitle.ele('mainbooktitle').txt(title);

    const frontmatter = root.ele('frontmatter');
    const booklists = frontmatter.ele('booklists');
    booklists.ele('toc');

    chapters.forEach((chapter) => {
      // Use navtitle for chapter title if no href is provided (which acts as a container)
      const chapterNode = root.ele('chapter', { navtitle: chapter.title });
      chapter.recipes.forEach((recipe) => {
        chapterNode.ele('topicref', { href: `recipe_${recipe.id}.dita` });
      });
    });

    return doc.end({ prettyPrint: true });
  }

  generateMap(recipes: Recipe[], title: string): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' });
    doc.dtd({ pubID: '-//OASIS//DTD DITA Map//EN', sysID: 'map.dtd' });

    const root = doc.ele('map', { 'xml:lang': 'zh-CN' });

    root.ele('title').txt(title);

    recipes.forEach((recipe) => {
      root.ele('topicref', { href: `recipe_${recipe.id}.dita` });
    });

    return doc.end({ prettyPrint: true });
  }
}
