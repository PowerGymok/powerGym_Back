import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ResponseClassSchedule {
  @IsNotEmpty({ message: 'El id de la cita de una clase no puede estar vacío' })
  @IsUUID()
  id: string;

  @IsNotEmpty({ message: 'La fecha de cita de la clase no puede estar vacía' })
  @IsDate({ message: 'La fecha de cita de la clase debe tener formato "date"' })
  date: Date;

  @IsNotEmpty({
    message: 'La duracion de la cita de la clase no puede estar vacía',
  })
  @IsDate({
    message: 'La duración de la cita de la clase debe tener formato "date"',
  })
  time: Date;

  @IsOptional({
    message:
      'La cantidad de espacios disponibles de la clase citada es opcional',
  })
  @IsNumber()
  spaces_available: number;

  @IsNotEmpty({ message: 'La clase citada tiene que estar activa o no' })
  isActive: boolean;

  @IsNotEmpty({
    message: 'La clase citada tiene que mostrar si es de membresía o no',
  })
  membership: boolean;

  @IsNotEmpty({
    message: 'La clase citada tiene que mostrar el id de la clase',
  })
  @IsUUID()
  class_id: string;
}
