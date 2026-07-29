#!/usr/bin/env node
/**
 * Dev orchestrator for social-poster.
 *
 * Starts a Cloudflare quick tunnel to the API, captures its public URL, and
 * injects it as PUBLIC_BASE_URL into the API process — so Instagram (which
 * fetches images from a public URL) works in dev with no manual copy/paste.
 * Then runs the Flask API and the Vite web dev server together.
 *
 * Order matters: the API validates PUBLIC_BASE_URL at startup (when DRY_RUN=0),
 * so the tunnel URL must be known *before* the API boots — which is why this is
 * a custom launcher rather than plain `concurrently`.
 *
 * If `cloudflared` isn't installed, it logs a warning and starts without a
 * tunnel (fine for DRY_RUN=1; a live post will then fail config validation).
 */
import { spawn } from 'node:child_process';

const API_PORT = process.env.PORT || '5050';
const TUNNEL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

const children = [];
let shuttingDown = false;

function write(tag, color, chunk) {
  const text = chunk.toString();
  for (const line of text.split('\n')) {
    if (line.length) process.stdout.write(`\x1b[${color}m[${tag}]\x1b[0m ${line}\n`);
  }
}

function start(tag, color, cmd, args, extraEnv = {}) {
  const child = spawn(cmd, args, {
    cwd: import.meta.dirname,
    env: { ...process.env, ...extraEnv },
  });
  child.stdout.on('data', (d) => write(tag, color, d));
  child.stderr.on('data', (d) => write(tag, color, d));
  child.on('exit', (code) => {
    if (!shuttingDown) {
      write('dev', '31', `${tag} exited (${code}); shutting down`);
      shutdown(code ?? 1);
    }
  });
  children.push(child);
  return child;
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) c.kill('SIGTERM');
  setTimeout(() => process.exit(code), 300);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function startApiAndWeb(publicBaseUrl) {
  const apiEnv = publicBaseUrl ? { PUBLIC_BASE_URL: publicBaseUrl } : {};
  start('api', '34', '.venv/bin/python', ['scripts/server.py'], apiEnv);
  start('web', '32', 'npm', ['--prefix', 'web', 'run', 'dev']);
}

// Launch the tunnel first; start the rest once we see its URL.
// A missing `cloudflared` binary surfaces as an async 'error' event (ENOENT),
// not a throw, so we fall back to a no-tunnel start there.
let started = false;
const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${API_PORT}`], {
  cwd: import.meta.dirname,
});
children.push(tunnel);

const onData = (d) => {
  write('tunnel', '35', d);
  if (started) return;
  const match = d.toString().match(TUNNEL_RE);
  if (match) {
    started = true;
    write('dev', '36', `tunnel ready → PUBLIC_BASE_URL=${match[0]}`);
    startApiAndWeb(match[0]);
  }
};
tunnel.stdout.on('data', onData);
tunnel.stderr.on('data', onData);

tunnel.on('error', (err) => {
  if (started || shuttingDown) return;
  if (err.code === 'ENOENT') {
    write('dev', '33', 'cloudflared not found — starting without a tunnel (DRY_RUN only)');
    write('dev', '33', 'install it with: brew install cloudflared');
    started = true;
    startApiAndWeb(null);
  } else {
    write('dev', '31', `tunnel error: ${err.message}`);
    shutdown(1);
  }
});

tunnel.on('exit', (code) => {
  if (!shuttingDown && started) {
    write('dev', '31', `tunnel exited (${code}); shutting down`);
    shutdown(code ?? 1);
  }
});
