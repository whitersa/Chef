import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { OperationLog } from './operation-log.entity';

@Global() // Make it global so we don't have to import it everywhere
@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
