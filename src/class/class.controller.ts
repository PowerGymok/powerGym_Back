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

@Controller('clases')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('/')
  @HttpCode(200)
  get_all_classes() {
    return this.classService.get_classes();
  }

  @Roles(Role.Admin, Role.Coach)
  @UseGuards(RolesGuard)
  @Post('crear')
  @HttpCode(201)
  create_new_class(@Body() clase: CreateClass) {
    return this.classService.create_new_class(clase);
  }

  @Roles(Role.Admin, Role.Coach)
  @UseGuards(RolesGuard)
  @Put(':id')
  update_a_class(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() clase: UpdateClass,
  ) {
    return this.classService.update_class(id, clase);
  }

  @Roles(Role.Admin, Role.Coach)
  @UseGuards(RolesGuard)
  @Patch(':id/delete')
  delete_a_class(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete_class(id);
  }
}
