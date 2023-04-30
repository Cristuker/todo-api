import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Logger,
  Res,
  Get,
  Param,
  Patch,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Response } from "express";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("user")
export class UserController {
  private readonly logger = new Logger();

  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    try {
      const emailAlreadyExists = await this.userService.findByEmail(
        createUserDto.email,
      );

      if (emailAlreadyExists) {
        return response.status(HttpStatus.CONFLICT).send();
      }

      const createdUser = await this.userService.create(createUserDto);

      return response.status(HttpStatus.CREATED).send({
        data: createdUser,
      });
    } catch (error) {
      this.logger.error("[Post /user]", error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: "Erro ao criar usuário",
      });
    }
  }

  @Get("/:id")
  async getUserById(@Param("id") id: string, @Res() response: Response) {
    const user = await this.userService.findOne(Number(id));
    return response.status(HttpStatus.OK).send({
      data: user,
    });
  }

  @Patch("/:id")
  async updateUser(
    @Param("id") id: string,
    @Res() response: Response,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto.email) {
      const emailAlreadyExists = await this.userService.findByEmail(
        updateUserDto.email,
      );
      if (emailAlreadyExists) {
        return response
          .status(HttpStatus.CONFLICT)
          .send({ message: "Esse e-mail já está em uso" });
      }
    }

    const updatedUser = await this.userService.update(
      Number(id),
      updateUserDto,
    );

    return response.status(HttpStatus.OK).send({
      data: updatedUser,
    });
  }
}
