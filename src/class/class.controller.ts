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
} from '@nestjs/common';
import { ClassService } from './class.service';
import { ResponseClass } from 'src/class/dtos/ResponseClass.dto';
import { CreateClass } from './dtos/CreateClass.dto';

@Controller('clases')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('seeder')
  seeder() {
    return this.classService.seeder();
  }

  @Get('/')
  @HttpCode(200)
  get_all_classes() {
    return this.classService.get_classes();
  }

  // Rol de admin puede hacer esto
  @Post('crear')
  @HttpCode(201)
  create_new_class(@Body() clase: CreateClass) {
    return this.classService.create_new_class(clase);
  }

  // Rol de admin puede hacer esto - Mauro ya lo hizo el rol
  @Put(':id')
  update_a_class(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() clase: ResponseClass,
  ) {
    return this.classService.update_class(id, clase);
  }

  // Rol de admin puede hacer esto
  @Patch(':id/delete')
  delete_a_class(@Param('id', ParseUUIDPipe) id: string) {
    return this.classService.delete_class(id);
  }
}
