import { Injectable } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';

@Injectable()
export class ReservationService {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  reserve_class(id_user: string, id_class_schedule: string) {
    return this.reservationRepository.create_reserve(
      id_user,
      id_class_schedule,
    );
  }

  cancel_reserve_class(id: string) {
    return this.reservationRepository.cancel_reserve(id);
  }

  get_reservations() {
    return this.reservationRepository.get_reserves();
  }

  get_reserves_by_id(id: string) {
    return this.reservationRepository.get_by_id(id);
  }
}
