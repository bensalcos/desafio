const request = require('supertest');
const express = require('express');
const opportunitiesRouter = require('../src/routes/opportunities');
const { authenticateToken } = require('../src/middleware/auth');

const app = express();
app.use(express.json());

// Mock de autenticación para pruebas
app.use((req, res, next) => {
  req.user = { role: 'ADMIN' };
  next();
});

app.use('/api/opportunities', opportunitiesRouter);

// Mock simple de Prisma (para unit test aislado)
jest.mock('../src/services/db', () => ({
  prisma: {
    opportunity: {
      findMany: jest.fn().mockResolvedValue([]),
    }
  }
}));

describe('GET /api/opportunities', () => {
  it('Debe devolver status 200 y un array vacio', async () => {
    const response = await request(app).get('/api/opportunities');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
