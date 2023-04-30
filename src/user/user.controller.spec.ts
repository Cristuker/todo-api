import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AppModule } from "../app.module";
import * as request from "supertest";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRepository } from "./user.repository";

describe("UserController", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe("POST", () => {
    it("should create a user", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian@email.com`,
      };

      await request(app.getHttpServer())
        .post("/user")
        .send(newUser)
        .expect(HttpStatus.CREATED);
    });

    it("should give error when email already exits", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian123@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      await prisma.user.create({
        data: newUser,
      });

      const res = await request(app.getHttpServer())
        .post("/user")
        .send(newUser);
      expect(res.status).toBe(HttpStatus.CONFLICT);
    });

    it("should return 500 when throw", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian123@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      jest.spyOn(prisma.user, "findUnique").mockRejectedValue(() => {
        new Error("Error");
      });

      const res = await request(app.getHttpServer())
        .post("/user")
        .send(newUser);
      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("GET", () => {
    it("should return a user by id", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian123@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const user = await prisma.user.create({
        data: newUser,
      });

      const res = await request(app.getHttpServer()).get(`/user/${user.id}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.firstName).toBe(newUser.firstName);
      expect(res.body.data.lastName).toBe(newUser.lastName);
      expect(res.body.data.email).toBe(newUser.email);
      expect(res.body.data).toHaveProperty("createdAt");
      expect(res.body.data).toHaveProperty("updatedAt");
    });
  });

  describe("PATCH", () => {
    it("should update first", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian123@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const user = await prisma.user.create({
        data: newUser,
      });

      const res = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send({
          firstName: "Mateus",
        });

      const savedUser = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
      });

      expect(res.body.data.firstName).toBe("Mateus");
      expect(savedUser.firstName).toBe(res.body.data.firstName);
    });

    it("should try update email", async () => {
      const newUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian123@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const secondUser = {
        firstName: "Cristian",
        lastName: "Silva",
        email: `cristian.teste@email.com`,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      const user = await prisma.user.create({
        data: newUser,
      });

      await prisma.user.create({
        data: secondUser,
      });

      const res = await request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send({
          email: secondUser.email,
        });
      expect(res.status).toBe(HttpStatus.CONFLICT);
      expect(res.body.message).toBe("Esse e-mail já está em uso");
    });
  });
});
