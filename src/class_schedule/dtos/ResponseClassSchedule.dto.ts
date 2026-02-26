import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class ResponseClassSchedule {
  @IsNotEmpty({ message: 'El id de la cita de una clase no puede estar vacío' })
  @IsUUID()
  id: string;

  @IsNotEmpty({ message: 'La fecha de cita de la clase no puede estar vacía' })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de cita de la clase debe tener formato "date"' })
  date: Date;

  @IsNotEmpty({
    message: 'El horario de la cita de la clase no puede estar vacía',
  })
  time: string;

  @IsNotEmpty({ message: 'La clase citada tiene que estar activa o no' })
  isActive: boolean;

  @IsNotEmpty({
    message: 'La clase citada tiene que mostrar cuantos token ocupa',
  })
  token: number;

  @IsNotEmpty({
    message: 'La clase citada tiene que mostrar el id de la clase',
  })
  @IsUUID()
  class_id: string;
}
