/*
// Buscamos el usuario
    const find_user = await this.usersRepository.getUserById(user_id);

    // VALIDACION -- couch no se puede unir a una clase
    if (!find_user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (find_class.spaces_available <= 0) {
      throw new BadRequestException('No hay cupos disponibles para la clase');
    }

    // Restamos el espacio en la clase
    find_class.spaces_available -= 1;

    const new_user_assigned = await this.classScheduleRepository.save({
      user  
    });
*/

// VALIDACIONES SOLO USER PUEDE AGENDARSE A CLASES Y ADMIN PREGUNTAR A FRONT
