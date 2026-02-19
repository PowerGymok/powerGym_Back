import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() //Hacer guardian para que solo admin pueda ingresar
  getAllUsers(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const validPage = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const validLimit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    return this.usersService.getAllUsers(validPage, validLimit);
  }

  @Get('email')
  getByEmail(@Query() email: GetByEmailDto) {
    return this.usersService.getByEmail(email);
  }

  @Get(':id') //Hacer guardian para que solo admin y usuario propietario de la cuenta pueda ingresar
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Put('update/:id') //Es necesario hacer un Guard para que un admin o un usuario solo pueda modificar SU información y no la de otro usuario.
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newUserData: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, newUserData);
  }

  @Put('inactive/:id') //Hacer un guardian para que solamente un usuario propietario de la cuenta o el admin puedan desactivar.
  inactiveUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.inactiveUser(id);
  }
}
