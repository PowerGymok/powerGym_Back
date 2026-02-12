/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class usersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(page: number, limit: number) {
    const skip: number = (page - 1) * limit;
    const allUsers = await this.usersRepository.find({
      skip: skip,
      take: limit,
    });

    return allUsers.map(({ password, ...userNoPassword }) => userNoPassword);
  }
}
