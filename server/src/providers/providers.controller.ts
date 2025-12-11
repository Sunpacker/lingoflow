import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProvidersService } from "./providers.service";

@Controller("providers")
@UseGuards(AuthGuard("jwt"))
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @Get()
  async getProviders() {
    return this.providersService.findAll();
  }
}
