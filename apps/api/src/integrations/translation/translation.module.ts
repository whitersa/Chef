import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranslationService } from './translation.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
