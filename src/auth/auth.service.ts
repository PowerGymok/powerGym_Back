import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Inyectamos JwtService para poder firmar (crear) los tokens
  constructor(private readonly jwtService: JwtService) {}

  /**
   * MÉTODO TEMPORAL
   * ----------------------------------------------------------------------------
   * Como todavía no existe el módulo Users ni la base de datos,
   * simulamos usuarios "en memoria".
   *
   * Esto SOLO sirve para poder:
   * - probar el login
   * - generar JWT
   * - avanzar con guards y roles
   *
   * Más adelante este método se va a reemplazar por:
   * 1) buscar el usuario en la DB por email
   * 2) comparar la contraseña con bcrypt
   */
  validateUser(email: string, password: string) {
    // normalizamos el email (evita problemas de mayúsculas/minúsculas)
    const e = (email || '').trim().toLowerCase();

    // usuario administrador de prueba
    if (e === 'admin@mail.com' && password === '1234')
      return { email: e, role: 'ADMIN' };

    // usuario normal de prueba
    if (e === 'user@mail.com' && password === '1234')
      return { email: e, role: 'USER' };

    // si no coincide, devolvemos 401
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  /**
   * Genera el JWT
   * ----------------------------------------------------------------------------
   * El payload es la información que viajará dentro del token.
   * Este payload después el AuthGuard lo va a leer y lo guardo en req.user.
   */
  login(user: { email: string; role: string }) {
    const payload = {
      email: user.email,
      role: user.role,
    };

    // firmo el token
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
