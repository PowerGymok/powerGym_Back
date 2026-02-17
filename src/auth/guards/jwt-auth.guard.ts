import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service'; // ajustá el path si es necesario

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No se envio token');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token invalido');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      //  SIMPLE: si está inactivo, no entra
      const activo = await this.usersService.findIsActiveById(payload.sub);
      if (!activo) {
        throw new UnauthorizedException('Usuario desactivado');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
