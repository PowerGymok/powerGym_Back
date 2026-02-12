/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/common/roles.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  @Column({ type: 'bigint' })
  phone: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column()
  Birthdate: Date;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'text' })
  profileImg: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  courtesyClass: boolean;

  //   tokenPackId: FK
  // reservationId: FK
  // chatId: Fk
}
