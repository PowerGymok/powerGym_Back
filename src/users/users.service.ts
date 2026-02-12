/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { usersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: usersRepository) {}

  getAllUsers(page: number, limit: number) {
    return this.usersRepository.getAllUsers(page, limit);
  }
}
