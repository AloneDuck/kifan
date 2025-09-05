import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { CurrentUser } from '../common/interfaces/current-user.interface';
import { ChecksService } from './checks.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { UpdateCheckDto } from './dto/update-check.dto';

@ApiTags('checks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Get()
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.checksService.findAll(user.sub);
  }

  @Post()
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateCheckDto,
  ) {
    return this.checksService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: UpdateCheckDto,
  ) {
    return this.checksService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    return this.checksService.remove(user.sub, id);
  }
}
