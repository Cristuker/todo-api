import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { faker } from '@faker-js/faker';
import * as supertest from 'supertest';

describe('User controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let request;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // if I dont use global pipes should not work
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    request = supertest(app.getHttpServer());
  });

  beforeEach(async () => {
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  it('should create a user', async () => {
    const user: CreateUserDto = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      isActive: true,
      lastName: faker.name.lastName(),
    };

    await request.post('/user').send(user).expect(201);
  });

  it('should return 400 and a message when missing some property', async () => {
    const user = {
      firstName: faker.name.firstName(),
      isActive: true,
      lastName: faker.name.lastName(),
    };

    await request
      .post('/user')
      .send(user)
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).toEqual({
          error: 'Bad Request',
          message: ['E-mail é obrigatório', 'email must be an email'],
          statusCode: 400,
        });
      });
  });

  it('get by id', async () => {
    const rawUser = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      isActive: true,
      lastName: faker.name.lastName(),
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const user = await prisma.user.create({
      data: rawUser,
    });

    const expectUser = {
      ...rawUser,
      updatedAt: rawUser.updatedAt.toISOString(),
      createdAt: rawUser.createdAt.toISOString(),
      id: user.id,
    };

    await request
      .get(`/user/${user.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(expectUser);
      });
  });

  it('delete by id', async () => {
    const rawUser = {
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      isActive: true,
      lastName: faker.name.lastName(),
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    const user = await prisma.user.create({
      data: rawUser,
    });

    await request
      .delete(`/user/${user.id}`)
      .expect(HttpStatus.NO_CONTENT)
      .then(async () => {
        const result = await prisma.user.findFirst({
          where: {
            id: user.id,
          },
        });
        expect(result).toBeFalsy();
      });
  });
});
