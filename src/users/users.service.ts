import { BadRequestException, Injectable } from '@nestjs/common';
import { usersRepository } from './users.repository';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserGoogleDto } from './dto/createUser-google.dto';
import type { CompleteProfileDto } from 'src/auth/dto/completeProfile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: usersRepository) {}

  getAllUsers(page: number, limit: number) {
    return this.usersRepository.getAllUsers(page, limit);
  }

  getUserById(id: string) {
    return this.usersRepository.getUserById(id);
  }

  async updateUser(id: string, newUserData: UpdateUserDto) {
    if (newUserData.password) {
      if (newUserData.password !== newUserData.confirmPassword)
        throw new BadRequestException('Las contraseñas no coinciden');
      const hashedPassword = await bcrypt.hash(newUserData.password, 10);
      newUserData.password = hashedPassword;
    }
    delete newUserData.confirmPassword;
    return this.usersRepository.updateUser(id, newUserData);
  }

  inactiveUser(id: string) {
    return this.usersRepository.inactiveUser(id);
  }

  getByEmail(email: GetByEmailDto) {
    return this.usersRepository.getByEmail(email);
  }

  //  lo usa Auth para el signup
  createUser(dto: CreateUserDto) {
    return this.usersRepository.createUser(dto);
  }

  findIsActiveById(id: string): Promise<boolean> {
    return this.usersRepository.findIsActiveById(id);
  }

  findOrCreateByGoogle(dto: CreateUserGoogleDto) {
    return this.usersRepository.findOrCreateByGoogle(dto);
  }
  completeGoogleProfile(userId: string, dto: CompleteProfileDto) {
    return this.usersRepository.completeGoogleProfile(userId, dto);
  }

  getUserEntityById(id: string) {
    return this.usersRepository.getUserEntityById(id);
  }
}
