import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // endpoint de login
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    //  valido credenciales
    const user = this.authService.validateUser(body.email, body.password);

    //  si son correctas genero el token
    return this.authService.login(user);
  }
}
