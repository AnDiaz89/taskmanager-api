const request = require('supertest');
const app = require('../app');

describe('Autenticación', () => {
  test('rechaza registro con email ya existente', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'prueba@test.com', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Ese email ya está registrado');
  });

  test('rechaza login con contraseña incorrecta', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'prueba@test.com', password: 'contraseñaIncorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });

  test('rechaza acceso a tareas sin token', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No se proporcionó token de autenticación');
  });
});