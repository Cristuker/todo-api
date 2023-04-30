import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  async findBy(prop: string, value: number | string) {
    return await this.prisma.user.findUnique({
      where: {
        [prop]: value,
      },
    });
  }

  async update(id: number, updateUser: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...updateUser,
      },
    });
  }
}
