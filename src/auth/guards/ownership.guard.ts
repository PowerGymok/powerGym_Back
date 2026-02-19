import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Role } from 'src/common/roles.enum';

export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user: JwtPayload }).user;
    const userId = request.params.id;

    if (user.role === Role.Admin) return true;
    if (user.sub === userId) return true;

    throw new ForbiddenException('No tiene permisos para realizar esta acción');
  }
}
