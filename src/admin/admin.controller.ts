import { Controller, Get } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('어드민')
@Controller('v1/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get()
  async findAll(){
    return await this.adminService.findAll()
  }
}