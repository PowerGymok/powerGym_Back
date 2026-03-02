import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('clases')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('/')
  @HttpCode(200)
  get_all_classes() {
    return this.classService.get_classes();
  }

  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create')
  @HttpCode(201)
  create_new_class(@Body() clase: CreateClass) {
    return this.classService.create_new_class(clase);
  }

  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @HttpCode(200)
  update_a_class(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() clase: UpdateClass,
  ) {
    return this.classService.update_class(id, clase);
  }

  @Roles(Role.Coach, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('delete/:id')
  @HttpCode(200)
  delete_a_class(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete_class(id);
  }
}
