const http = require('http');
const fs = require('fs');
const path = require('path');
const rimeService = require('./electron/rime-service.cjs');
const { exec } = require('child_process');

const PORT = 5174;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === '/api/system-info') {
      const data = await rimeService.getSystemInfo();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/versions') {
      const data = await rimeService.fetchRemoteVersions();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/backups') {
      const data = await rimeService.listBackups();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/create-backup' && req.method === 'POST') {
      const body = await parseBody(req);
      const data = await rimeService.createBackup(body.note);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/deploy' && req.method === 'POST') {
      const body = await parseBody(req);
      const logs = [];
      const data = await rimeService.deployVersion({
        sha: body.sha,
        title: body.title,
        logCallback: (msg) => logs.push(msg)
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...data, logs }));
      return;
    }

    if (url.pathname === '/api/restore' && req.method === 'POST') {
      const body = await parseBody(req);
      const logs = [];
      const data = await rimeService.restoreBackup(body.backupId, (msg) => logs.push(msg));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...data, logs }));
      return;
    }

    if (url.pathname === '/api/reload' && req.method === 'POST') {
      const data = await rimeService.reloadRime();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/open-folder' && req.method === 'POST') {
      const dir = rimeService.getRimeDir();
      const openCmd = process.platform === 'darwin' ? `open "${dir}"` : process.platform === 'win32' ? `explorer "${dir}"` : `xdg-open "${dir}"`;
      exec(openCmd);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    if (url.pathname === '/api/check-app-update') {
      const data = await rimeService.checkAppUpdate();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === '/api/open-external' && req.method === 'POST') {
      const body = await parseBody(req);
      if (body.url) {
        const cmd = process.platform === 'darwin' ? `open "${body.url}"` : process.platform === 'win32' ? `start "" "${body.url}"` : `xdg-open "${body.url}"`;
        exec(cmd);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    if (url.pathname === '/api/install-app-update' && req.method === 'POST') {
      const body = await parseBody(req);
      const logs = [];
      const data = await rimeService.downloadAndInstallAppUpdate({
        asset: body.asset,
        logCallback: (msg) => logs.push(msg)
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...data, logs }));
      return;
    }

    if (url.pathname === '/api/export-trime-package' && req.method === 'POST') {
      const body = await parseBody(req);
      const logs = [];
      const data = await rimeService.exportTrimePackage({
        layoutType: body?.layoutType || 'samsung',
        targetZipPath: body?.targetZipPath,
        versionSha: body?.versionSha,
        versionTitle: body?.versionTitle,
        logCallback: (msg) => logs.push(msg)
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...data, logs }));
      return;
    }

    if (url.pathname === '/api/trime-editor/latest-package') {
      const zipBuf = rimeService.getLatestTrimeZipBuffer();
      if (!zipBuf) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No staged package found' }));
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'inline; filename="staging_package.zip"',
        'Content-Length': zipBuf.length
      });
      res.end(zipBuf);
      return;
    }

    if (url.pathname === '/api/open-trime-editor' && req.method === 'POST') {
      const editorDir = rimeService.getTrimeEditorDir();
      const indexPath = path.join(editorDir, 'index.html');
      const urlToOpen = `file://${indexPath}?auto=1`;
      const cmd = process.platform === 'darwin'
        ? `open "${urlToOpen}"`
        : process.platform === 'win32'
          ? `start "" "${urlToOpen}"`
          : `xdg-open "${urlToOpen}"`;
      exec(cmd);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, url: urlToOpen }));
      return;
    }

    // Static serving for trime-editor
    if (url.pathname.startsWith('/trime-editor')) {
      const editorDir = rimeService.getTrimeEditorDir();
      let relPath = url.pathname.replace(/^\/trime-editor\/?/, '');
      if (!relPath || relPath === '/') relPath = 'index.html';
      const filePath = path.join(editorDir, relPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json',
          '.zip': 'application/zip',
          '.png': 'image/png'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('API error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

server.listen(PORT, () => {
  console.log(`Rime Onion Manager Web Backend running on http://localhost:${PORT}`);
});
