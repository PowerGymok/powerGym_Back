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
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
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

    //  comparar contraseña con bcrypt
    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta fue creada con Google, inicia sesión con Google',
      );
    }
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

  // SIGNUP REAL + bcrypt hash
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
    console.log(created);

    // await this.notificationsService.sendWelcomeEmail()
    return this.login({
      id: created.id,
      email: created.email,
      role: created.role,
    });
  }
}
