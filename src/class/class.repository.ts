import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Repository } from 'typeorm';

@Injectable({})
export class ClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async load_seeder(seed_classes): Promise<Class[]> {
    return this.classRepository.save(seed_classes);
  }

  get_classes() {
    return this.classRepository.find({
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
      },
    });
  }
  // falta que traiga la relacion
}
