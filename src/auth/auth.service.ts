import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  // inyecto JwtService para poder crear el token
  constructor(private readonly jwtService: JwtService) {}

  // por ahora simulo usuarios porque todavía no tenemos DB
  // esto después se reemplaza buscando en la base de datos
  validateUser(email: string, password: string) {
    const e = (email || '').trim().toLowerCase();

    // admin de prueba
    if (e === 'admin@mail.com' && password === '1234')
      return { id: '1', email: e, role: Role.Admin };

    // coach de prueba
    if (e === 'coach@mail.com' && password === '1234')
      return { id: '2', email: e, role: Role.Coach };

    // usuario común de prueba
    if (e === 'user@mail.com' && password === '1234')
      return { id: '3', email: e, role: Role.User };

    // si no coincide → 401
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  // acá creo el JWT
  // el payload es la info mínima del usuario que va dentro del token
  login(user: { id: string; email: string; role: Role }) {
    const payload = {
      sub: user.id, // id del usuario
      email: user.email, // para identificarlo
      role: user.role, // después lo usan los roles/guards
    };

    // firmo el token y lo devuelvo
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
