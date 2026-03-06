import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserGoogleDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  googleId: string;

  @IsOptional()
  @IsString()
  profileImg?: string;
}
