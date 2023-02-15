import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const userCreated = await this.prisma.user.create({
      data: {
        ...createUserDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
    return userCreated;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    const result = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    return result;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
