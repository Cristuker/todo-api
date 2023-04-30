import { IsBoolean, IsEmail, IsString } from "class-validator";
export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  @IsString({ message: "E-mail é obrigatório" })
  email: string;

  @IsBoolean()
  isActive: boolean;
}
