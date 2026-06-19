#!/usr/bin/env node
'use strict';

// Proxy locale — nessun npm install richiesto.
// Serve i file statici dalla directory corrente e forwarda /api/* a dndapi.fromtheb.ee

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 3010;
const API_HOST   = 'dndapi.fromtheb.ee';
const API_PREFIX = '/api';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const server = http.createServer((req, res) => {
  // Pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // ── API proxy ──────────────────────────────────────
  if (req.url.startsWith(API_PREFIX)) {
    const options = {
      hostname: API_HOST,
      port:     443,
      path:     req.url,           // e.g. /api/entities?type=spell
      method:   req.method,
      headers:  Object.assign({}, req.headers, {
        host: API_HOST,
        'accept-encoding': 'identity', // evita gzip/br: il proxy non decomprime
      }),
    };

    const upstream = https.request(options, (upstream_res) => {
      const headers = Object.assign({}, CORS, {
        'content-type': upstream_res.headers['content-type'] || 'application/json',
      });
      // pass cache headers if present
      if (upstream_res.headers['cache-control'])
        headers['cache-control'] = upstream_res.headers['cache-control'];

      res.writeHead(upstream_res.statusCode, headers);
      upstream_res.pipe(res, { end: true });
    });

    upstream.on('error', err => {
      console.error('[proxy] upstream error:', err.message);
      res.writeHead(502, CORS);
      res.end(JSON.stringify({ error: 'PROXY_ERROR', message: err.message }));
    });

    req.pipe(upstream, { end: true });
    return;
  }

  // ── Static files ───────────────────────────────────
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);

  // Safety: stay inside the directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Nuovo5e  →  http://localhost:${PORT}\n`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} già in uso. Modifica PORT in proxy.js.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
