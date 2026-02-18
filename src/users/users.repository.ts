/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/roles.enum';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';
import { CreateUserDto } from './dto/createUser.dto';

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
      where: { role: Role.User },
    });

    return allUsers.map(({ password, ...userNoPassword }) => userNoPassword);
  } //Falta verificar si va a traer los usuarios activos o los activos e inactivos

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id: id, role: Role.User },
    });

    if (!user)
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);

    const { password, ...userNoPassword } = user;
    return userNoPassword;
  } //Incluir las relaciones necesarias al traer el usuario. Por ejemplo, reservas de clases, id´s de chats.

  async updateUser(id: string, newUserData: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user || user.isActive !== true)
      throw new NotFoundException('No se encontró el usuario');
    //encriptar contraseña del nuevo usuario
    //if(newUserData.password){
    //  const hashedPassword
    //}
    const mergedUser = this.usersRepository.merge(user, newUserData);
    const savedUser = await this.usersRepository.save(mergedUser);
    return 'El usuario ha sido actualizado exitosamente';
  }

  async inactiveUser(id: string) {
    // Hace falta hacer borrado logico
    const user = await this.usersRepository.findOneBy({ id });
    if (!user || user.isActive !== true)
      throw new NotFoundException('No se encontró al usuario');
    user.isActive = false;
    await this.usersRepository.save(user);
    return 'El usuario ha sido eliminado exitosamente';
  }

  async getByEmail(searchEmail: GetByEmailDto) {
    const user = await this.usersRepository.findOne({
      where: { email: searchEmail.email },
    });

    if (!user)
      throw new NotFoundException(
        `El usuario con el email ${searchEmail} no se encuentra en la base de datos`,
      );
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const email = (dto.email || '').trim().toLowerCase();

    const exists = await this.usersRepository.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('El email ya está registrado');
    }

    const user = this.usersRepository.create({
      ...dto,
      email,
    });

    return this.usersRepository.save(user);
  }
  //busco usuario activos por lo que charlamos de la duracion del token .. si esta en false no puede hacer nada
  async findIsActiveById(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'isActive'],
    });

    return !!user?.isActive;
  }
}
