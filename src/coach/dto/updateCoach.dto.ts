import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateCoachDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(3, 80, { message: 'El nombre debe tener entre 3 y 50 caracteres' })
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacia' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La contraseña no cumple con los requisitos',
  })
  @Length(3, 60, {
    message: 'La contraseña debe tener entre 3 y 60 caracteres',
  })
  password: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacia' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La contraseña no cumple con los requisitos',
  })
  @Length(3, 60, {
    message: 'La contraseña debe tener entre 3 y 60 caracteres',
  })
  confirmPassword: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacio' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El teléfono debe ser un número' },
  )
  phone: number;

  @IsOptional()
  @IsNotEmpty({ message: 'La dirección no puede estar vacia' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(5, 30, { message: 'La dirección debe tener entre 5 y 30 caracteres' })
  address: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La ciudad no puede estar vacia' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @Length(3, 20, { message: 'La ciudad debe tener entre 3 y 20 caracteres' })
  city: string;

  @IsOptional()
  //revisar si hay un decorador para este atributo ---> @isURL puede ser
  profileImg: string;
}
