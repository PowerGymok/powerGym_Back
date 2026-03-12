import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenPackage } from './token-package.entity';
import { CreateTokenPackageDto } from './dto/create-token-package.dto';

@Injectable()
export class TokenPackageService {
  constructor(
    @InjectRepository(TokenPackage)
    private readonly tokenPackageRepository: Repository<TokenPackage>,
  ) {}

  // esto es para crear un paquete de tokens solo el admin
  async create(dto: CreateTokenPackageDto): Promise<TokenPackage> {
    const pkg = this.tokenPackageRepository.create(dto);
    return this.tokenPackageRepository.save(pkg);
  }

  // muestra al usuario en la tienda
  async findAllActive(): Promise<TokenPackage[]> {
    return this.tokenPackageRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' }, // De más barato a más caro
    });
  }

  // Busca un paquete por ID (lo usa PaymentsModule al procesar una compra)
  async findOne(id: string): Promise<TokenPackage> {
    const pkg = await this.tokenPackageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(
        `Paquete de tokens con id ${id} no encontrado`,
      );
    }
    return pkg;
  }

  // Desactiva un paquete sin borrarlo (soft delete)
  async deactivate(id: string): Promise<TokenPackage> {
    const pkg = await this.findOne(id);
    pkg.isActive = false;
    return this.tokenPackageRepository.save(pkg);
  }

  async activatePkg(id: string) {
    const pkg = await this.tokenPackageRepository.findOne({
      where: { id },
      select: { id: true, name: true, price: true, isActive: true },
    });
    if (!pkg || pkg.isActive === true)
      throw new BadRequestException(
        'El paquete de tokens no existe o ya se encuentra activo',
      );

    pkg.isActive = true;
    const pkgSaved = await this.tokenPackageRepository.save(pkg);
    return pkgSaved;
  }
}
