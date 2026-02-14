import { Injectable } from '@nestjs/common';
import { CreateClass } from 'src/class/dtos/ResponseClass.dto';
import { ClassRepository } from './class.repository';

@Injectable({})
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}

  private seed_classes = [
    {
      name: 'Boxeo',
      duration: '1 hr',
      description: 'Clases de boxeo recreativo',
      capacity: 5,
      isActive: true,
    },
    {
      name: 'Body Pump',
      duration: '1 hr',
      description: 'Clases de Body Pump para principiantes',
      capacity: 10,
      isActive: true,
    },
    {
      name: 'Zumba Femenina',
      duration: '1 hr',
      description: 'Clases de zumba para mujeres',
      capacity: 10,
      isActive: true,
    },
    {
      name: 'Zumba Masculina',
      duration: '1 hr',
      description: 'Clases de zumba para hombres',
      capacity: 0,
      isActive: false,
    },
  ];

  async seeder() {
    await this.classRepository.load_seeder(this.seed_classes);
    return { message: 'Seeder de clases cargado correctamente' };
  }

  get_classes() {
    return this.classRepository.get_classes();
  }

  update_class(id: number, clase: CreateClass) {
    const index = this.seed_classes.findIndex((c) => c.id === id);

    this.seed_classes.splice(index, 1, {
      ...this.seed_classes[index],
      ...clase,
    });

    return this.seed_classes[index];
  }

  create_new_class(clase: CreateClass) {
    const new_class = {
      id: this.seed_classes.length + 1,
      isActive: true,
      ...clase,
    };

    this.seed_classes.push(new_class);

    return new_class;
  }

  delete_class(id: number) {
    const index = this.seed_classes.findIndex((c) => c.id === id);

    this.seed_classes[index].isActive = false;

    return {
      success: true,
      message: 'Clase eliminada con éxito',
    };
  }
}
