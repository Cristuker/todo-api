import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { faker } from '@faker-js/faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    pactum.request.setBaseUrl('http://localhost:3333');
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

    return pactum.spec().post('/user').withBody(user).expectStatus(201);
  });

  it('should return 400 and a message when missing some property', () => {
    const user = {
      firstName: faker.name.firstName(),
      isActive: true,
      lastName: faker.name.lastName(),
    };

    return pactum
      .spec()
      .post('/user')
      .withBody(user)
      .expectStatus(400)
      .expectBody({
        error: 'Bad Request',
        message: ['E-mail é obrigatório', 'email must be an email'],
        statusCode: 400,
      });
  });
});
