import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    category: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    fAQ: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    banner: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    exchangeRate: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
    },
    code: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    page: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    promoCode: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---- Public endpoints ----

  it('GET /api/faq → returns success response with array', () => {
    return request(app.getHttpServer())
      .get('/api/faq')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('GET /api/categories → returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/categories')
      .expect(200);
  });

  it('GET /api/products → returns paginated result', () => {
    return request(app.getHttpServer())
      .get('/api/products')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('GET /api/exchange-rates → returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/exchange-rates')
      .expect(200);
  });

  // ---- Validation ----

  it('POST /api/auth/register → validates email format (returns 400)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123456' })
      .expect(400);
  });

  it('POST /api/auth/register → validates minimum password length (returns 400)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'valid@example.com', password: '123' })
      .expect(400);
  });

  // ---- Protected routes ----

  it('GET /api/admin/analytics → requires auth (returns 401)', () => {
    return request(app.getHttpServer())
      .get('/api/admin/analytics')
      .expect(401);
  });

  it('GET /api/orders → requires auth (returns 401)', () => {
    return request(app.getHttpServer())
      .get('/api/orders')
      .expect(401);
  });

  // ---- 404 for unknown routes ----

  it('GET /api/nonexistent → returns 404', () => {
    return request(app.getHttpServer())
      .get('/api/nonexistent-route-xyz')
      .expect(404);
  });
});
