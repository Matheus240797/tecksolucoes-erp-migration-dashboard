const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }

  try {
    const { rows: portalRows } = await pool.query(
      'SELECT id, name FROM portals ORDER BY name'
    );

    const { rows: moduleRows } = await pool.query(
      'SELECT id, portal_id, name FROM modules ORDER BY name'
    );

    const { rows: integrationRows } = await pool.query(
      'SELECT name FROM integrations ORDER BY name'
    );

    const { rows: bcRows } = await pool.query(
      'SELECT name FROM bounded_contexts ORDER BY name'
    );

    const { rows: checklistRows } = await pool.query(
      'SELECT id, label FROM checklist_items ORDER BY id'
    );

    const portals = portalRows.map((p) => ({
      id: p.id,
      name: p.name,
      modules: moduleRows
        .filter((m) => m.portal_id === p.id)
        .map((m) => ({ id: m.id, name: m.name })),
    }));

    const integrations = integrationRows.map((r) => r.name);
    const boundedContexts = bcRows.map((r) => r.name);
    const checklistItems = checklistRows.map((r) => ({
      id: r.id,
      label: r.label,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        portals,
        integrations,
        boundedContexts,
        checklistItems,
      })
    );
  } catch (err) {
    console.error('Erro em /api/data', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Erro ao carregar dados base' }));
  }
};

