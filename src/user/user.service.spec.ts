import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { AppModule } from "../app.module";
import { UserRepository } from "./user.repository";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserService, UserRepository],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
