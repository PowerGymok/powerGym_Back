import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './interfaces/google-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // LOGIN
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  // SIGNUP REAL
  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  //  AUTH/ME  → devuelve el usuario del token
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  //GOOGLE

  //  esta ruta NO hace nada visible
  // solo dispara a Passport → Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // passport automáticamente redirige a Google
  }

  //  Google vuelve acá después del login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: { user: GoogleUser }) {
    console.log('USER FROM GOOGLE:', req.user);
    return req.user; // por ahora mostramos lo que vino de Google
  }
}
