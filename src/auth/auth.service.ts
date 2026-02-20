import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/roles.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { CreateUserDto } from '../users/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserGoogleDto } from '../users/dto/createUser-google.dto'; // ajustá el path si tu carpeta dto es otra

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    role: Role;
  }> {
    const e = (email || '').trim().toLowerCase();

    let user: User;
    try {
      user = await this.usersService.getByEmail({ email: e });
    } catch {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario dado de baja');
    }

    // Si no tiene password, es cuenta Google (no puede loguear por password)
    if (!user.password) {
      throw new UnauthorizedException('Este usuario se registró con Google');
    }

    // comparo contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  login(user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  // SIGNUP + bcrypt hash
  async signup(dto: CreateUserDto) {
    const email = (dto.email || '').trim().toLowerCase();
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const created = await this.usersService.createUser({
      ...dto,
      email,
      password: passwordHasheada,
    });

    return this.login({
      id: created.id,
      email: created.email,
      role: created.role,
    });
  }

  // GOOGLE LOGIN COMPLETO (DB + JWT)
  async googleLogin(googleUser: {
    email: string;
    googleId: string;
    name: string;
    picture?: string;
  }) {
    const email = (googleUser.email || '').trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Google no devolvió email');
    }

    const dto: CreateUserGoogleDto = {
      email,
      googleId: googleUser.googleId,
      name: googleUser.name,
      profileImg: googleUser.picture,
    };

    // 1 creo o linkeo usuario en DB
    const user = await this.usersService.findOrCreateByGoogle(dto);

    // 2 si está inactivo, no lo dejo loguearse
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario dado de baja');
    }

    // 3 firmo token real (sub = user.id)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      provider: 'google',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 4 devuelvo token + data útil
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }
}
