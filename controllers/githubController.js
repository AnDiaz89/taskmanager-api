const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getGithubActivity(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user.githubUsername) {
      return res.status(400).json({ error: 'No has configurado tu usuario de GitHub' });
    }

    const [reposResponse, eventsResponse] = await Promise.all([
      axios.get(`https://api.github.com/users/${user.githubUsername}/repos`, {
        params: { sort: 'updated', per_page: 5 },
      }),
      axios.get(`https://api.github.com/users/${user.githubUsername}/events/public`, {
        params: { per_page: 5 },
      }),
    ]);

    const repos = reposResponse.data.map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      url: repo.html_url,
      updatedAt: repo.updated_at,
    }));

    const events = eventsResponse.data.map((event) => ({
      type: event.type,
      repo: event.repo.name,
      createdAt: event.created_at,
    }));

    res.json({ repos, events });
  } catch (error) {
    console.error(error);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Usuario de GitHub no encontrado' });
    }
    res.status(500).json({ error: 'Error al consultar GitHub' });
  }
}

module.exports = { getGithubActivity };