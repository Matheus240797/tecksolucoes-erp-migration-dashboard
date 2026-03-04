const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  res.end('Method Not Allowed');
};

async function handleGet(_req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT value, updated_at FROM app_state WHERE key = $1',
      ['migration_checklist']
    );

    if (!rows.length) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify({ state: {}, lastSaved: null }));
    }

    const row = rows[0];
    const value = row.value || {};

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        state: value,
        lastSaved: row.updated_at,
      })
    );
  } catch (err) {
    console.error('Erro em GET /api/state', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Erro ao carregar estado' }));
  }
}

async function handlePost(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8') || '{}';
    const parsed = JSON.parse(rawBody);
    const state = parsed && parsed.state ? parsed.state : {};

    const now = new Date();

    await pool.query(
      `
        INSERT INTO app_state (key, value, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `,
      ['migration_checklist', state, now]
    );

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        lastSaved: now.toISOString(),
      })
    );
  } catch (err) {
    console.error('Erro em POST /api/state', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Erro ao salvar estado' }));
  }
}

