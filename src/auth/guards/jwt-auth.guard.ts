import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
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

      // guardo el usuario autenticado en la request
      request.user = payload;

      /*
       (cuando exista UsersService y DB):
    
      Acá voy a buscar el usuario real en la base de datos usando payload.sub.
      Si el usuario está desactivado (isActive = false) voy a rechazar la request.

      Ejemplo:
      const user = await usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario desactivado');
      }

      Esto evita que un usuario dado de baja siga usando un token válido.
      */

      return true;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
