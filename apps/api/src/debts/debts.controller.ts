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
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DebtsService } from './debts.service';

@ApiTags('debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.debtsService.findAll(user.sub);
  }

  @Post()
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateDebtDto,
  ) {
    return this.debtsService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    return this.debtsService.remove(user.sub, id);
  }
}
