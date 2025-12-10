import {
  Controller,
  Post,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { DitaRunnerService } from '@chefos/publisher';
import { RecipesService } from '../recipes/recipes.service'; // Assuming this exists and is exported

@Controller('publisher')
export class PublisherController {
  constructor(
    private readonly ditaRunner: DitaRunnerService,
    private readonly recipesService: RecipesService,
  ) {}

  @Post('recipe/:id/pdf')
  async publishRecipePdf(@Param('id') id: string, @Res() res: Response) {
    const recipe = await this.recipesService.findOne(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    try {
      const pdfPath = await this.ditaRunner.publishRecipeToPdf(recipe);

      res.download(pdfPath, `recipe-${recipe.name}.pdf`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).send('Could not download file');
          }
        }
      });
    } catch (error) {
      const err = error as Error;
      console.error(err);
      throw new InternalServerErrorException(`Failed to generate PDF: ${err.message}`);
    }
  }
}
