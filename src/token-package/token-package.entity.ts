import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../transactions/transactions.entity';

// Esta entidad es el CATÁLOGO de paquetes de tokens disponibles
// Ejemplo: "Paquete Básico: 100 tokens por $5", "Paquete Pro: 500 tokens por $20"
// El admin los crea, el usuario los compra con Stripe
@Entity({ name: 'token_packages' })
export class TokenPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre del paquete: "Starter", "Pro", "Elite"
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  // Descripción opcional del paquete
  @Column({ type: 'text', nullable: true })
  description: string;

  // Cantidad de tokens que el usuario recibe al comprar este paquete
  @Column({ type: 'int', nullable: false })
  tokenAmount: number;

  // Precio real en dinero que paga el usuario (ej: 9.99)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  // Si está disponible para comprar (false = lo oculta del catálogo)
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Un paquete puede estar asociado a muchas transacciones de compra
  @OneToMany(() => Transaction, (transaction) => transaction.tokenPackage)
  transactions: Transaction[];
}
