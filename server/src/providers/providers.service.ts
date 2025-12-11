import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Provider } from "../database/entities";

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>
  ) {}

  async findAll(): Promise<Provider[]> {
    return this.providersRepository.find();
  }

  async findById(id: string): Promise<Provider | undefined> {
    return this.providersRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Provider | undefined> {
    return this.providersRepository.findOne({ where: { name } });
  }

  async create(providerData: Partial<Provider>): Promise<Provider> {
    const provider = this.providersRepository.create(providerData);
    return this.providersRepository.save(provider);
  }
}
