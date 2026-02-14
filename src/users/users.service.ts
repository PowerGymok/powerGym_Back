import { BadRequestException, Injectable } from '@nestjs/common';
import { usersRepository } from './users.repository';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: usersRepository) {}

  getAllUsers(page: number, limit: number) {
    return this.usersRepository.getAllUsers(page, limit);
  }

  getUserById(id: string) {
    return this.usersRepository.getUserById(id);
  }

  updateUser(id: string, newUserData: UpdateUserDto) {
    if (newUserData.password !== newUserData.confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');
    return this.usersRepository.updateUser(id, newUserData);
  }

  inactiveUser(id: string) {
    return this.usersRepository.inactiveUser(id);
  }

  getByEmail(email: GetByEmailDto) {
    return this.usersRepository.getByEmail(email);
  }
}
