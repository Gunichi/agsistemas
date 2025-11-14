import { Module } from '@nestjs/common';
import { MembershipIntentsService } from './membership-intents.service';
import { MembershipIntentsController } from './membership-intents.controller';

@Module({
  controllers: [MembershipIntentsController],
  providers: [MembershipIntentsService],
  exports: [MembershipIntentsService],
})
export class MembershipIntentsModule {}
