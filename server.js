const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Caminho do arquivo SQLite
const dbPath = path.join(__dirname, 'migration.db');
const db = new sqlite3.Database(dbPath);

// ── SEED DATA (para popular as tabelas de referência) ──
const SEED_PORTALS = [
  {
    id: 'akrk',
    name: 'Portal AKRK',
    modules: [
      { id: 'akrk_integracao', name: 'Integração Financeira AKRK' },
      { id: 'akrk_retorno',    name: 'Retorno AKRK' },
      { id: 'akrk_envio',      name: 'Envio / Remessa AKRK' },
    ],
  },
  {
    id: 'teck',
    name: 'Portal Teck',
    modules: [
      { id: 'teck_cnab',      name: 'CNABs' },
      { id: 'teck_b3',        name: 'B3 / Registro de Operações' },
      { id: 'teck_dataprev',  name: 'Dataprev' },
      { id: 'teck_simulador', name: 'Simulador' },
      { id: 'teck_rh',        name: 'RH' },
      { id: 'teck_booking',   name: 'Booking' },
      { id: 'teck_averbacao', name: 'Averbação' },
      { id: 'teck_orbital',   name: 'Orbital' },
      { id: 'teck_clicksign', name: 'ClickSign / Assinatura' },
      { id: 'teck_kyc',       name: 'KYC / Unico' },
      { id: 'teck_proposta',  name: 'Proposta / Esteira' },
      { id: 'teck_ccb',       name: 'CCB' },
      { id: 'teck_lastro',    name: 'Lastro' },
      { id: 'teck_portab',    name: 'Portabilidade' },
      { id: 'teck_refin',     name: 'Refinanciamento' },
      { id: 'teck_cartao',    name: 'Cartão Consignado' },
      { id: 'teck_cobranca',  name: 'Cobrança' },
      { id: 'teck_relatorio', name: 'Relatórios' },
    ],
  },
  {
    id: 'abc',
    name: 'Portal ABC Card',
    modules: [
      { id: 'abc_cartao', name: 'Gestão de Cartão' },
      { id: 'abc_fatura', name: 'Fatura / Extrato' },
    ],
  },
  {
    id: 'v1',
    name: 'Front Consig v1',
    modules: [
      { id: 'v1_sac',       name: 'SAC' },
      { id: 'v1_juridico',  name: 'Jurídico' },
      { id: 'v1_rh',        name: 'RH Interno' },
      { id: 'v1_carteira',  name: 'Gestão de Carteira' },
      { id: 'v1_ouvidoria', name: 'Ouvidoria' },
      { id: 'v1_procon',    name: 'Procon' },
      { id: 'v1_dashboard', name: 'Dashboard Gerencial' },
      { id: 'v1_config',    name: 'Configurações' },
      { id: 'v1_usuarios',  name: 'Usuários / Permissões' },
      { id: 'v1_auditoria', name: 'Auditoria / Logs' },
    ],
  },
  {
    id: 'v2',
    name: 'Front Consig v2 (CRM)',
    modules: [
      { id: 'v2_crm',       name: 'CRM / Pipeline' },
      { id: 'v2_promotora', name: 'Gestão de Promotoras' },
      { id: 'v2_corretor',  name: 'Cadastro de Corretores' },
      { id: 'v2_lead',      name: 'Leads / Originação' },
      { id: 'v2_proposta',  name: 'Proposta (CRM)' },
      { id: 'v2_campanha',  name: 'Campanhas' },
      { id: 'v2_notif',     name: 'Notificações' },
      { id: 'v2_whatsapp',  name: 'WhatsApp / Mensageria' },
      { id: 'v2_relatorio', name: 'Relatórios CRM' },
      { id: 'v2_acesso',    name: 'Controle de Acesso' },
      { id: 'v2_integ',     name: 'Integrações Externas' },
    ],
  },
  {
    id: 'internal',
    name: 'Internal (Automações)',
    modules: [
      { id: 'int_cnab1',  name: 'CNAB — Banco Santander' },
      { id: 'int_cnab2',  name: 'CNAB — Banco Paulista' },
      { id: 'int_cnab3',  name: 'CNAB — SOLIS' },
      { id: 'int_cnab4',  name: 'CNAB — HEMERA' },
      { id: 'int_cnab5',  name: 'CNAB — Orbitall' },
      { id: 'int_ccb1',   name: 'CCB — Gerador v1' },
      { id: 'int_ccb2',   name: 'CCB — Gerador v2' },
      { id: 'int_ccb3',   name: 'CCB — Gerador Portabilidade' },
      { id: 'int_lastro1',name: 'Lastro — Fundo SOLIS' },
      { id: 'int_lastro2',name: 'Lastro — Fundo HEMERA' },
      { id: 'int_lastro3',name: 'Lastro — Banco Paulista' },
      { id: 'int_conv1',  name: 'Conversor — Retorno B3' },
      { id: 'int_conv2',  name: 'Conversor — Dataprev XML' },
      { id: 'int_auto1',  name: 'Automação — Averbação Noturna' },
      { id: 'int_auto2',  name: 'Automação — Cobrança Batch' },
    ],
  },
];

const SEED_INTEGRATIONS = [
  'B3','Dataprev','Santander','Banco Paulista','SOLIS','HEMERA',
  'Orbitall','Dock','ClickSign','Único/KYC','WhatsApp','BigBoost',
  'Autbank','Função','Banco Interno','INSS','Siape'
];

const SEED_BOUNDED_CONTEXTS = [
  'Originação','BackOffice','Formalização','Liberação',
  'Pós-Crédito','Financeiro','Relacionamento','Corporativo','Plataforma'
];

const SEED_CHECKLIST_ITEMS = [
  { id: 'c1', label: 'Tem responsável técnico definido' },
  { id: 'c2', label: 'Documentação mínima existente (README ou wiki)' },
  { id: 'c3', label: 'Integrações externas mapeadas' },
  { id: 'c4', label: 'Dependências com outros módulos conhecidas' },
  { id: 'c5', label: 'Sem alterações planejadas nos próximos 30 dias' },
  { id: 'c6', label: 'Dados de produção catalogados (tabelas / schemas)' },
  { id: 'c7', label: 'Comportamento em caso de falha mapeado' },
  { id: 'c8', label: 'Stakeholder de negócio identificado' },
];

// Cria tabelas e popula se estiverem vazias
db.serialize(() => {
  // Estado do app
  db.run(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabelas de referência
  db.run(`
    CREATE TABLE IF NOT EXISTS portals (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS modules (
      id        TEXT PRIMARY KEY,
      portal_id TEXT NOT NULL,
      name      TEXT NOT NULL,
      FOREIGN KEY (portal_id) REFERENCES portals(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS integrations (
      name TEXT PRIMARY KEY
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bounded_contexts (
      name TEXT PRIMARY KEY
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id    TEXT PRIMARY KEY,
      label TEXT NOT NULL
    )
  `);

  // Seed das tabelas (idempotente: só insere se estiver vazio)
  db.get('SELECT COUNT(*) as cnt FROM portals', (err, row) => {
    if (err) {
      console.error('Erro ao verificar portals', err);
      return;
    }
    if (row && row.cnt === 0) {
      const insertPortal = db.prepare('INSERT INTO portals (id, name) VALUES (?, ?)');
      const insertModule = db.prepare('INSERT INTO modules (id, portal_id, name) VALUES (?, ?, ?)');
      SEED_PORTALS.forEach(p => {
        insertPortal.run(p.id, p.name);
        p.modules.forEach(m => {
          insertModule.run(m.id, p.id, m.name);
        });
      });
      insertPortal.finalize();
      insertModule.finalize();
    }
  });

  db.get('SELECT COUNT(*) as cnt FROM integrations', (err, row) => {
    if (err) {
      console.error('Erro ao verificar integrations', err);
      return;
    }
    if (row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO integrations (name) VALUES (?)');
      SEED_INTEGRATIONS.forEach(name => stmt.run(name));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as cnt FROM bounded_contexts', (err, row) => {
    if (err) {
      console.error('Erro ao verificar bounded_contexts', err);
      return;
    }
    if (row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO bounded_contexts (name) VALUES (?)');
      SEED_BOUNDED_CONTEXTS.forEach(name => stmt.run(name));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as cnt FROM checklist_items', (err, row) => {
    if (err) {
      console.error('Erro ao verificar checklist_items', err);
      return;
    }
    if (row && row.cnt === 0) {
      const stmt = db.prepare('INSERT INTO checklist_items (id, label) VALUES (?, ?)');
      SEED_CHECKLIST_ITEMS.forEach(item => stmt.run(item.id, item.label));
      stmt.finalize();
    }
  });
});

app.use(express.json());

// Servir arquivos estáticos (index.html, etc.)
app.use(express.static(__dirname));

// Retorna o estado atual salvo
app.get('/api/state', (req, res) => {
  db.get(
    'SELECT value, updated_at FROM app_state WHERE key = ?',
    ['migration_checklist'],
    (err, row) => {
      if (err) {
        console.error('Erro ao ler estado do SQLite', err);
        return res.status(500).json({ error: 'Erro ao carregar estado' });
      }

      if (!row) {
        return res.json({ state: {}, lastSaved: null });
      }

      let parsed = {};
      try {
        parsed = JSON.parse(row.value);
      } catch (e) {
        parsed = {};
      }

      res.json({ state: parsed, lastSaved: row.updated_at });
    }
  );
});

// Retorna todos os dados de referência (portais, módulos, integrações, etc.)
app.get('/api/data', (req, res) => {
  db.all('SELECT id, name FROM portals ORDER BY name', (err, portalsRows) => {
    if (err) {
      console.error('Erro ao buscar portals', err);
      return res.status(500).json({ error: 'Erro ao carregar dados' });
    }

    db.all('SELECT id, portal_id, name FROM modules ORDER BY name', (err2, modulesRows) => {
      if (err2) {
        console.error('Erro ao buscar modules', err2);
        return res.status(500).json({ error: 'Erro ao carregar dados' });
      }

      db.all('SELECT name FROM integrations ORDER BY name', (err3, integrationsRows) => {
        if (err3) {
          console.error('Erro ao buscar integrations', err3);
          return res.status(500).json({ error: 'Erro ao carregar dados' });
        }

        db.all('SELECT name FROM bounded_contexts ORDER BY name', (err4, bcRows) => {
          if (err4) {
            console.error('Erro ao buscar bounded_contexts', err4);
            return res.status(500).json({ error: 'Erro ao carregar dados' });
          }

          db.all('SELECT id, label FROM checklist_items ORDER BY id', (err5, checklistRows) => {
            if (err5) {
              console.error('Erro ao buscar checklist_items', err5);
              return res.status(500).json({ error: 'Erro ao carregar dados' });
            }

            const portals = portalsRows.map(p => ({
              id: p.id,
              name: p.name,
              modules: modulesRows.filter(m => m.portal_id === p.id).map(m => ({
                id: m.id,
                name: m.name,
              })),
            }));

            const integrations = integrationsRows.map(r => r.name);
            const boundedContexts = bcRows.map(r => r.name);
            const checklistItems = checklistRows.map(r => ({ id: r.id, label: r.label }));

            res.json({
              portals,
              integrations,
              boundedContexts,
              checklistItems,
            });
          });
        });
      });
    });
  });
});

// Salva o estado completo vindo do front-end
app.post('/api/state', (req, res) => {
  const state = req.body && req.body.state ? req.body.state : {};
  const json = JSON.stringify(state);
  const now = new Date().toISOString();

  db.run(
    `
      INSERT INTO app_state (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    ['migration_checklist', json, now],
    function (err) {
      if (err) {
        console.error('Erro ao salvar estado no SQLite', err);
        return res.status(500).json({ error: 'Erro ao salvar estado' });
      }
      res.json({ ok: true, lastSaved: now });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

