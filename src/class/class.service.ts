import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassRepository } from './class.repository';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';
import { FilesService } from 'src/files/files.service';

@Injectable({})
export class ClassService {
  constructor(
    private readonly classRepository: ClassRepository,
    private readonly filesService: FilesService,
  ) {}

  get_classes() {
    return this.classRepository.get_classes();
  }

  create_new_class(clase: CreateClass) {
    return this.classRepository.create_class(clase);
  }

  update_class(id: string, clase: UpdateClass) {
    return this.classRepository.update(id, clase);
  }

  delete_class(id: string) {
    return this.classRepository.deleted_class(id);
  }

  //  SUBIR IMAGEN
  async uploadClassImage(id: string, file: Express.Multer.File) {
    const classEntity = await this.classRepository.getById(id);
    if (!classEntity) throw new NotFoundException('Clase no encontrada');

    const uploaded = await this.filesService.uploadImage(
      file,
      'powergym/classes',
    );

    if (classEntity.cloudinaryId) {
      await this.filesService.deleteImage(classEntity.cloudinaryId);
    }

    return this.classRepository.updateImage(
      id,
      uploaded.secure_url,
      uploaded.public_id,
    );
  }
}
