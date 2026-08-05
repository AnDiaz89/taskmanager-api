const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Registrar un nuevo usuario
async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }

    // Hashear la contraseña (nunca se guarda en texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: 'Usuario creado correctamente', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

// Iniciar sesión
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseña ingresada vs. la hasheada guardada
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function updateGithubUsername(req, res) {
  try {
    const { githubUsername } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { githubUsername: githubUsername || null },
    });

    res.json({ githubUsername: user.githubUsername });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario de GitHub' });
  }
}

module.exports = { register, login, updateGithubUsername };