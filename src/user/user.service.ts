import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRepository } from "./user.repository";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const userCreated = await this.userRepository.create(createUserDto);
    return userCreated;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findBy("email", email);
  }

  async findOne(id: number) {
    const result = await this.userRepository.findBy("id", id);
    return result;
  }

  async update(id: number, updateUser: UpdateUserDto) {
    return await this.userRepository.update(id, updateUser);
  }
}
