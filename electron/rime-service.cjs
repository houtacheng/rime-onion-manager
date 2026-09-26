const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

const GITHUB_REPO = 'houtacheng/rime-bopomo-onion-mixed';
const APP_REPO = 'houtacheng/rime-onion-manager';
const samsungLayout = require('./samsung-layout.cjs');

const TRIME_EDITOR_DIR = fs.existsSync('/Users/sunda/Documents/鼠鬚管/trime-editor')
  ? '/Users/sunda/Documents/鼠鬚管/trime-editor'
  : path.join(os.homedir(), 'Documents', '鼠鬚管', 'trime-editor');

let latestTrimeZipBuffer = null;

function getLatestTrimeZipBuffer() {
  if (latestTrimeZipBuffer) return latestTrimeZipBuffer;
  const stagingPath = path.join(TRIME_EDITOR_DIR, 'staging_package.zip');
  if (fs.existsSync(stagingPath)) {
    return fs.readFileSync(stagingPath);
  }
  return null;
}

function getTrimeEditorDir() {
  return TRIME_EDITOR_DIR;
}

function getAppVersion() {
  try {
    const pkgPath = path.join(__dirname, '../package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.version || '1.3.0';
    }
  } catch (e) {}
  return '1.3.0';
}

function getRimeDir() {
  const platform = process.platform;
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Rime');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Rime');
  } else {
    const fcitx5Path = path.join(os.homedir(), '.local', 'share', 'fcitx5', 'rime');
    if (fs.existsSync(fcitx5Path)) return fcitx5Path;
    return path.join(os.homedir(), '.config', 'ibus', 'rime');
  }
}

function getPlatformName() {
  const p = process.platform;
  if (p === 'darwin') return 'macOS (鼠鬚管 Squirrel)';
  if (p === 'win32') return 'Windows (小狼毫 Weasel)';
  return 'Linux (fcitx5 / ibus)';
}

async function getSystemInfo() {
  const rimeDir = getRimeDir();
  const dirExists = fs.existsSync(rimeDir);
  const platform = getPlatformName();
  const appVersion = getAppVersion();

  let installedSha = null;
  let installedMessage = null;
  let installedDate = null;

  // 1. Check .onion_manager.json
  const stateFile = path.join(rimeDir, '.onion_manager.json');
  if (fs.existsSync(stateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      installedSha = state.installedSha;
      installedMessage = state.installedMessage;
      installedDate = state.installedAt;
    } catch (e) {
      console.error('Error reading .onion_manager.json:', e);
    }
  }

  // 2. Check if .git exists in Rime folder (fallback/detect git clones)
  if (!installedSha && fs.existsSync(path.join(rimeDir, '.git'))) {
    try {
      const headSha = await runCmd('git rev-parse HEAD', rimeDir);
      const headMsg = await runCmd('git log -1 --pretty=%B', rimeDir);
      const headDate = await runCmd('git log -1 --pretty=%cI', rimeDir);
      installedSha = headSha.trim();
      installedMessage = headMsg.trim().split('\n')[0];
      installedDate = headDate.trim();
    } catch (e) {
      // ignore
    }
  }

  return {
    platform,
    rimeDir,
    dirExists,
    installedSha,
    installedMessage,
    installedDate,
    appVersion
  };
}

async function fetchRemoteVersions() {
  const headers = {
    'User-Agent': 'Rime-Onion-Manager-Desktop',
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    // Check releases first
    let releases = [];
    try {
      const relRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
        headers,
        signal: controller.signal
      });
      if (relRes.ok) {
        releases = await relRes.json();
      }
    } catch (e) {}

    if (releases.length > 0) {
      clearTimeout(timer);
      return releases.map(r => ({
        id: r.tag_name,
        sha: r.target_commitish || r.tag_name,
        shortSha: (r.target_commitish || r.tag_name).substring(0, 7),
        title: r.name || r.tag_name,
        body: r.body,
        date: r.published_at,
        isRelease: true,
        downloadUrl: r.zipball_url || `https://github.com/${GITHUB_REPO}/archive/refs/tags/${r.tag_name}.zip`
      }));
    }

    // If no releases, fetch recent commits
    const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=25`, {
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!commitRes.ok) {
      throw new Error(`GitHub API 回傳狀態碼 ${commitRes.status}: ${commitRes.statusText}`);
    }
    const commits = await commitRes.json();
    return commits.map(c => ({
      id: c.sha,
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      title: c.commit.message.split('\n')[0],
      body: c.commit.message,
      date: c.commit.committer ? c.commit.committer.date : c.commit.author.date,
      author: c.commit.author ? c.commit.author.name : 'Unknown',
      isRelease: false,
      downloadUrl: `https://github.com/${GITHUB_REPO}/archive/${c.sha}.zip`
    }));
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('連線 GitHub 逾時（8秒），可能是網路或防火牆限制。建議使用「本地匯入」功能。');
    }
    console.error('fetchRemoteVersions error:', err);
    throw err;
  }
}

function getBackupsDir() {
  const rimeDir = getRimeDir();
  return path.join(rimeDir, '.backups');
}

async function listBackups() {
  const backupsDir = getBackupsDir();
  if (!fs.existsSync(backupsDir)) return [];

  const items = fs.readdirSync(backupsDir);
  const result = [];

  for (const item of items) {
    const itemPath = path.join(backupsDir, item);
    const stat = fs.statSync(itemPath);
    if (!stat.isDirectory()) continue;

    let info = {
      id: item,
      date: stat.mtime.toISOString(),
      note: '自動備份',
      fromSha: null
    };

    const infoPath = path.join(itemPath, 'backup-info.json');
    if (fs.existsSync(infoPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
        info = { ...info, ...parsed };
      } catch (e) {}
    }

    result.push(info);
  }

  // Newest first
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return result;
}

async function createBackup(note = '手動備份', fromSha = null) {
  const rimeDir = getRimeDir();
  if (!fs.existsSync(rimeDir)) {
    throw new Error(`Rime 目錄不存在: ${rimeDir}`);
  }

  const backupsDir = getBackupsDir();
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}`;
  const backupPath = path.join(backupsDir, backupId);
  fs.mkdirSync(backupPath, { recursive: true });

  const ignored = new Set(['.backups', '.git', 'build']);

  function copyDirRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDirRecursive(rimeDir, backupPath);

  const info = {
    id: backupId,
    date: now.toISOString(),
    note,
    fromSha
  };
  fs.writeFileSync(path.join(backupPath, 'backup-info.json'), JSON.stringify(info, null, 2));

  return info;
}

async function deployVersion({ sha, title, logCallback = () => {} }) {
  const rimeDir = getRimeDir();
  if (!fs.existsSync(rimeDir)) {
    fs.mkdirSync(rimeDir, { recursive: true });
  }

  logCallback(`[1/5] 建立更新前安全快照備份...`);
  let prevSha = null;
  try {
    const info = await getSystemInfo();
    prevSha = info.installedSha;
  } catch (e) {}
  await createBackup(`部署 ${sha.substring(0, 7)} 前自動快照`, prevSha);
  logCallback(`[✓] 備份建立完成`);

  logCallback(`[2/5] 正在從 GitHub 下載版本 (${sha.substring(0, 7)})...`);
  const downloadUrl = `https://github.com/${GITHUB_REPO}/archive/${sha}.zip`;
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error(`無法下載檔案: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  logCallback(`[✓] 下載完成 (${Math.round(buffer.length / 1024)} KB)`);

  logCallback(`[3/5] 正在解壓縮檔案...`);
  const zip = new AdmZip(buffer);
  const tempDir = path.join(os.tmpdir(), `rime-onion-${Date.now()}`);
  zip.extractAllTo(tempDir, true);
  logCallback(`[✓] 解壓縮成功`);

  // GitHub zip usually has a single root folder inside: rime-bopomo-onion-mixed-<sha>
  const extractedItems = fs.readdirSync(tempDir);
  let contentRoot = tempDir;
  if (extractedItems.length === 1 && fs.statSync(path.join(tempDir, extractedItems[0])).isDirectory()) {
    contentRoot = path.join(tempDir, extractedItems[0]);
  }

  logCallback(`[4/5] 正在寫入設定檔至 ${rimeDir}... (保留個人使用者詞頻)`);
  // Files and directories to NEVER overwrite
  const protectedItems = new Set([
    'installation.yaml',
    'user.yaml',
    'custom_phrase.txt',
    '.backups',
    '.git',
    '.onion_manager.json'
  ]);

  function copyNewFiles(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Protect user database dirs like *.userdb
      if (entry.name.endsWith('.userdb')) {
        continue;
      }
      if (protectedItems.has(entry.name) && fs.existsSync(destPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyNewFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyNewFiles(contentRoot, rimeDir);

  // Write manager state
  const state = {
    installedSha: sha,
    installedMessage: title || 'GitHub Version',
    installedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(rimeDir, '.onion_manager.json'), JSON.stringify(state, null, 2));

  // Clean up tempDir
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}

  logCallback(`[✓] 檔案部署完成！`);

  logCallback(`[5/5] 正在通知 Rime 輸入法重新部署 (Reload)...`);
  const reloadRes = await reloadRime();
  if (reloadRes.success) {
    logCallback(`[🎉] 重新部署成功！所有設定已即時生效。`);
  } else {
    logCallback(`[⚠️] 輸入法重新部署回應: ${reloadRes.output || '需手動點選狀態列選單「重新部署」'}`);
  }

  return { success: true, installedSha: sha };
}

async function restoreBackup(backupId, logCallback = () => {}) {
  const rimeDir = getRimeDir();
  const backupPath = path.join(getBackupsDir(), backupId);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`找不到備份: ${backupId}`);
  }

  logCallback(`[1/4] 備份當前狀態至安全快照...`);
  await createBackup(`還原 ${backupId} 前自動快照`);

  logCallback(`[2/4] 正在還原檔案...`);
  const protectedItems = new Set([
    'backup-info.json',
    'installation.yaml',
    'user.yaml',
    '.backups'
  ]);

  function copyRestore(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      if (protectedItems.has(entry.name)) continue;
      if (entry.name.endsWith('.userdb')) continue; // never wipe userdb on restore

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRestore(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRestore(backupPath, rimeDir);
  logCallback(`[✓] 檔案還原完畢`);

  logCallback(`[3/4] 更新版本紀錄...`);
  const infoPath = path.join(backupPath, 'backup-info.json');
  if (fs.existsSync(infoPath)) {
    try {
      const bInfo = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      if (bInfo.fromSha) {
        const state = {
          installedSha: bInfo.fromSha,
          installedMessage: bInfo.note || 'Restored backup',
          installedAt: new Date().toISOString()
        };
        fs.writeFileSync(path.join(rimeDir, '.onion_manager.json'), JSON.stringify(state, null, 2));
      }
    } catch (e) {}
  }

  logCallback(`[4/4] 觸發輸入法重新部署...`);
  const reloadRes = await reloadRime();
  if (reloadRes.success) {
    logCallback(`[🎉] 重新部署成功！已成功還原至快照 ${backupId}`);
  } else {
    logCallback(`[⚠️] 輸入法重新部署回應: ${reloadRes.output || '請手動重新部署'}`);
  }

  return { success: true };
}

function runCmd(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout || stderr || '');
      }
    });
  });
}

async function findWeaselDeployer() {
  // 1. Try Windows Registry (HKCU and HKLM)
  const regKeys = [
    'HKCU\\Software\\Rime\\Weasel',
    'HKLM\\SOFTWARE\\Rime\\Weasel',
    'HKLM\\SOFTWARE\\WOW6432Node\\Rime\\Weasel'
  ];

  for (const key of regKeys) {
    try {
      const output = await runCmd(`reg query "${key}" /v WeaselRoot`);
      const match = output.match(/WeaselRoot\s+REG_\w+\s+([^\r\n]+)/i);
      if (match && match[1]) {
        const rootDir = match[1].trim();
        const exePath = path.join(rootDir, 'WeaselDeployer.exe');
        if (fs.existsSync(exePath)) {
          return exePath;
        }
      }
    } catch (e) {
      // Ignore registry query errors
    }
  }

  // 2. Scan standard installation directories dynamically
  const baseDirs = [
    process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Rime') : 'C:\\Program Files\\Rime',
    process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Rime') : 'C:\\Program Files (x86)\\Rime',
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Rime') : null,
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Rime')
  ].filter(Boolean);

  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) continue;

    // Check direct match in base directory
    const directExe = path.join(baseDir, 'WeaselDeployer.exe');
    if (fs.existsSync(directExe)) return directExe;

    // Scan subdirectories (e.g. weasel-0.16.3, weasel-0.15.0, etc.)
    try {
      const entries = fs.readdirSync(baseDir, { withFileTypes: true });
      const weaselDirs = entries
        .filter(d => d.isDirectory() && d.name.toLowerCase().startsWith('weasel'))
        .map(d => d.name)
        // Sort descending so newer versions (e.g. 0.17 > 0.16.3) take precedence
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));

      for (const subDir of weaselDirs) {
        const exePath = path.join(baseDir, subDir, 'WeaselDeployer.exe');
        if (fs.existsSync(exePath)) {
          return exePath;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback fixed paths
  const fallbacks = [
    'C:\\Program Files\\Rime\\weasel-0.16.3\\WeaselDeployer.exe',
    'C:\\Program Files\\Rime\\weasel-0.15.0\\WeaselDeployer.exe',
    'C:\\Program Files (x86)\\Rime\\weasel-0.16.3\\WeaselDeployer.exe',
    'C:\\Program Files (x86)\\Rime\\weasel-0.15.0\\WeaselDeployer.exe',
    'C:\\Program Files\\Rime\\weasel\\WeaselDeployer.exe',
    'C:\\Program Files (x86)\\Rime\\weasel\\WeaselDeployer.exe'
  ];

  for (const exe of fallbacks) {
    if (fs.existsSync(exe)) return exe;
  }

  return null;
}

async function reloadRime() {
  const platform = process.platform;
  if (platform === 'darwin') {
    const squirrelCandidates = [
      '/Library/Input Methods/Squirrel.app/Contents/MacOS/Squirrel',
      path.join(os.homedir(), 'Library/Input Methods/Squirrel.app/Contents/MacOS/Squirrel')
    ];
    for (const squirrelPath of squirrelCandidates) {
      if (fs.existsSync(squirrelPath)) {
        try {
          await runCmd(`"${squirrelPath}" --reload`);
          return { success: true, output: 'Squirrel --reload 執行成功' };
        } catch (err) {
          return { success: false, output: err.message };
        }
      }
    }
    return { success: false, output: '未找到 Squirrel.app，請確認已安裝鼠鬚管輸入法' };
  } else if (platform === 'win32') {
    const deployerExe = await findWeaselDeployer();
    if (deployerExe) {
      try {
        await runCmd(`"${deployerExe}" /deploy`);
        const verDir = path.basename(path.dirname(deployerExe));
        return { success: true, output: `WeaselDeployer /deploy 執行成功 (${verDir})` };
      } catch (e) {
        return { success: false, output: `執行 WeaselDeployer 失敗: ${e.message}` };
      }
    }
    return { success: false, output: '未找到 WeaselDeployer.exe，請手動從小狼毫選單點選「重新部署」' };
  } else {
    // Linux
    try {
      await runCmd('rime_deployer --build');
      return { success: true, output: 'rime_deployer --build 執行成功' };
    } catch (e) {
      return { success: false, output: e.message };
    }
  }

  return { success: false, output: '無法自動重載，請手動重新部署' };
}

async function deployFromLocal({ sourcePath, logCallback = () => {} }) {
  const rimeDir = getRimeDir();
  if (!fs.existsSync(rimeDir)) {
    fs.mkdirSync(rimeDir, { recursive: true });
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`指定的檔案或資料夾不存在: ${sourcePath}`);
  }

  const stat = fs.statSync(sourcePath);
  const isZip = !stat.isDirectory() && sourcePath.toLowerCase().endsWith('.zip');

  logCallback(`[1/4] 建立更新前安全快照備份...`);
  let prevSha = null;
  try {
    const info = await getSystemInfo();
    prevSha = info.installedSha;
  } catch (e) {}
  const baseName = path.basename(sourcePath);
  await createBackup(`本地匯入前自動快照 (${baseName})`, prevSha);
  logCallback(`[✓] 安全快照備份完成`);

  let contentRoot = sourcePath;
  let tempDir = null;

  if (isZip) {
    logCallback(`[2/4] 正在解壓縮本地 ZIP 檔案 (${baseName})...`);
    const zip = new AdmZip(sourcePath);
    tempDir = path.join(os.tmpdir(), `rime-local-${Date.now()}`);
    zip.extractAllTo(tempDir, true);
    logCallback(`[✓] 解壓縮成功`);

    const extractedItems = fs.readdirSync(tempDir);
    contentRoot = tempDir;
    if (extractedItems.length === 1 && fs.statSync(path.join(tempDir, extractedItems[0])).isDirectory()) {
      contentRoot = path.join(tempDir, extractedItems[0]);
    }
  } else {
    logCallback(`[2/4] 讀取本地資料夾: ${baseName}`);
  }

  logCallback(`[3/4] 正在複製設定檔至 Rime 目錄... (保護個人詞頻 userdb)`);
  const protectedItems = new Set([
    'installation.yaml',
    'user.yaml',
    'custom_phrase.txt',
    '.backups',
    '.git',
    '.onion_manager.json'
  ]);

  function copyNewFiles(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.name.endsWith('.userdb')) continue;
      if (protectedItems.has(entry.name) && fs.existsSync(destPath)) continue;

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyNewFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyNewFiles(contentRoot, rimeDir);

  if (tempDir) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }

  // Record state
  const state = {
    installedSha: 'local',
    installedMessage: `本地匯入: ${baseName}`,
    installedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(rimeDir, '.onion_manager.json'), JSON.stringify(state, null, 2));

  logCallback(`[✓] 本地檔案部署完畢！`);

  logCallback(`[4/4] 正在觸發 Rime 輸入法重新部署...`);
  const reloadRes = await reloadRime();
  if (reloadRes.success) {
    logCallback(`[🎉] 重新部署成功！所有設定已即時生效。`);
  } else {
    logCallback(`[⚠️] 輸入法重新部署回應: ${reloadRes.output || '請手動重新部署'}`);
  }

  return { success: true, sourceName: baseName };
}

function compareSemver(v1, v2) {
  const clean1 = (v1 || '').replace(/^v/i, '').split('-')[0];
  const clean2 = (v2 || '').replace(/^v/i, '').split('-')[0];
  const parts1 = clean1.split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function findMatchingAsset(assets = []) {
  if (!assets || !Array.isArray(assets)) return null;
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'win32') {
    const exeAsset = assets.find(a => a.name.toLowerCase().endsWith('.exe'));
    if (exeAsset) {
      return {
        name: exeAsset.name,
        url: exeAsset.browser_download_url,
        size: exeAsset.size
      };
    }
  } else if (platform === 'darwin') {
    const isArm = arch === 'arm64';
    let asset = null;
    if (isArm) {
      asset = assets.find(a => a.name.includes('arm64') && a.name.endsWith('.dmg')) ||
              assets.find(a => a.name.endsWith('.dmg')) ||
              assets.find(a => a.name.includes('arm64') && a.name.endsWith('.zip')) ||
              assets.find(a => a.name.endsWith('.zip'));
    } else {
      asset = assets.find(a => (a.name.includes('x64') || a.name.includes('mac')) && a.name.endsWith('.dmg')) ||
              assets.find(a => a.name.endsWith('.dmg')) ||
              assets.find(a => (a.name.includes('x64') || a.name.includes('mac')) && a.name.endsWith('.zip')) ||
              assets.find(a => a.name.endsWith('.zip'));
    }
    if (asset) {
      return {
        name: asset.name,
        url: asset.browser_download_url,
        size: asset.size
      };
    }
  } else {
    const linuxAsset = assets.find(a => a.name.endsWith('.AppImage') || a.name.endsWith('.deb') || a.name.endsWith('.tar.gz'));
    if (linuxAsset) {
      return {
        name: linuxAsset.name,
        url: linuxAsset.browser_download_url,
        size: linuxAsset.size
      };
    }
  }
  return null;
}

async function checkAppUpdate() {
  const currentVersion = getAppVersion();
  const headers = {
    'User-Agent': 'Rime-Onion-Manager-Desktop',
    'Accept': 'application/vnd.github.v3+json'
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`https://api.github.com/repos/${APP_REPO}/releases/latest`, {
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.status === 404) {
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion,
        message: '目前尚無已發布的新版本'
      };
    }

    if (!res.ok) {
      throw new Error(`GitHub API 回傳狀態碼 ${res.status}`);
    }

    const release = await res.json();
    const latestTag = release.tag_name || release.name || '';
    const latestVer = latestTag.replace(/^v/i, '');
    const hasUpdate = compareSemver(latestVer, currentVersion) > 0;
    const downloadAsset = findMatchingAsset(release.assets || []);

    return {
      hasUpdate,
      currentVersion,
      latestVersion: latestTag || latestVer,
      releaseUrl: release.html_url || `https://github.com/${APP_REPO}/releases`,
      releaseName: release.name || latestTag,
      releaseNotes: release.body || '',
      publishedAt: release.published_at,
      downloadAsset
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      error: err.name === 'AbortError' ? '連線逾時（6秒）' : err.message
    };
  }
}

async function downloadAndInstallAppUpdate({ asset, logCallback = () => {}, onBeforeQuit = () => {} }) {
  if (!asset || !asset.url) {
    throw new Error('未提供有效的安裝檔下載資訊');
  }

  const targetFileName = asset.name || `update-${Date.now()}`;
  const tempFilePath = path.join(os.tmpdir(), targetFileName);

  logCallback(`[1/3] 正在下載新版本安裝檔 (${asset.name})...`);

  const res = await fetch(asset.url);
  if (!res.ok) {
    throw new Error(`無法下載安裝檔: HTTP ${res.status} ${res.statusText}`);
  }

  const totalBytes = Number(res.headers.get('content-length')) || asset.size || 0;
  let downloadedBytes = 0;
  let lastReportPercent = -1;

  const fileStream = fs.createWriteStream(tempFilePath);

  for await (const chunk of res.body) {
    fileStream.write(chunk);
    downloadedBytes += chunk.length;
    if (totalBytes > 0) {
      const percent = Math.floor((downloadedBytes / totalBytes) * 100);
      if (percent !== lastReportPercent && (percent % 10 === 0 || percent === 100)) {
        lastReportPercent = percent;
        const curMB = (downloadedBytes / (1024 * 1024)).toFixed(1);
        const totMB = (totalBytes / (1024 * 1024)).toFixed(1);
        logCallback(`[1/3] 下載進度: ${curMB} MB / ${totMB} MB (${percent}%)`);
      }
    }
  }
  fileStream.end();

  await new Promise((resolve) => {
    if (fileStream.writableFinished) {
      resolve();
    } else {
      fileStream.on('finish', resolve);
    }
  });

  logCallback(`[✓] 安裝檔下載完成 (${(fs.statSync(tempFilePath).size / (1024 * 1024)).toFixed(1)} MB)`);
  logCallback(`[2/3] 準備執行安裝更新...`);

  const platform = process.platform;
  if (platform === 'win32') {
    logCallback(`[3/3] 正在以管理員權限啟動靜默安裝... 即將自動重啟管理器。`);

    const batContent = `@echo off\r\ntimeout /t 2 /nobreak >nul\r\nstart "" "${tempFilePath}" /S\r\nexit\r\n`;
    const scriptPath = path.join(os.tmpdir(), `rime-update-${Date.now()}.bat`);
    fs.writeFileSync(scriptPath, batContent, 'utf-8');

    const { spawn } = require('child_process');
    const child = spawn('cmd.exe', ['/c', scriptPath], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    if (typeof onBeforeQuit === 'function') {
      onBeforeQuit();
    }
    return { success: true, message: '已啟動安裝程序，即將重啟' };
  } else if (platform === 'darwin') {
    logCallback(`[3/3] 正在更新 macOS 應用程式套件...`);
    if (targetFileName.endsWith('.zip')) {
      const extractDir = path.join(os.tmpdir(), `rime-app-extract-${Date.now()}`);
      fs.mkdirSync(extractDir, { recursive: true });
      try {
        await runCmd(`/usr/bin/ditto -xk "${tempFilePath}" "${extractDir}"`);
      } catch (e) {
        const zip = new AdmZip(tempFilePath);
        zip.extractAllTo(extractDir, true);
      }

      const findApp = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item.endsWith('.app')) return path.join(dir, item);
        }
        for (const item of items) {
          const sub = path.join(dir, item);
          if (fs.statSync(sub).isDirectory()) {
            const found = findApp(sub);
            if (found) return found;
          }
        }
        return null;
      };

      const appBundle = findApp(extractDir);
      if (appBundle) {
        const appName = path.basename(appBundle);
        const targetAppPath = path.join('/Applications', appName);
        logCallback(`正在安裝應用程式至 ${targetAppPath}...`);

        if (fs.existsSync(targetAppPath)) {
          try {
            fs.rmSync(targetAppPath, { recursive: true, force: true });
          } catch (e) {
            await runCmd(`rm -rf "${targetAppPath}"`);
          }
        }
        await runCmd(`cp -R "${appBundle}" "/Applications/"`);

        logCallback(`[🎉] 安裝成功！正在重新啟動新版管理器...`);
        const { spawn } = require('child_process');
        const child = spawn('open', ['-n', targetAppPath], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();

        if (typeof onBeforeQuit === 'function') {
          onBeforeQuit();
        }
        return { success: true };
      } else {
        throw new Error('解壓縮檔案中未找到 .app 應用程式');
      }
    } else if (targetFileName.endsWith('.dmg')) {
      const mountPoint = path.join(os.tmpdir(), `rime-mount-${Date.now()}`);
      fs.mkdirSync(mountPoint, { recursive: true });
      try {
        await runCmd(`hdiutil attach -nobrowse -mountpoint "${mountPoint}" "${tempFilePath}"`);
        const items = fs.readdirSync(mountPoint);
        const appName = items.find(i => i.endsWith('.app'));
        if (appName) {
          const targetAppPath = path.join('/Applications', appName);
          if (fs.existsSync(targetAppPath)) {
            await runCmd(`rm -rf "${targetAppPath}"`);
          }
          await runCmd(`cp -R "${path.join(mountPoint, appName)}" "/Applications/"`);
          await runCmd(`hdiutil detach "${mountPoint}"`);

          logCallback(`[🎉] 安裝完成！即將重新開啟應用程式...`);
          const { spawn } = require('child_process');
          const child = spawn('open', ['-n', targetAppPath], {
            detached: true,
            stdio: 'ignore'
          });
          child.unref();

          if (typeof onBeforeQuit === 'function') {
            onBeforeQuit();
          }
          return { success: true };
        } else {
          throw new Error('DMG 中未找到 .app 檔案');
        }
      } catch (e) {
        try { await runCmd(`hdiutil detach "${mountPoint}"`); } catch (_) {}
        throw e;
      }
    }
  }

  logCallback(`已下載安裝檔至: ${tempFilePath}，請依照畫面完成安裝。`);
  return { success: true, filePath: tempFilePath };
}

function getTrimeLayoutYaml(layoutType = 'samsung') {
  if (layoutType === 'samsung') {
    return {
      layoutId: 'bopomo_samsung',
      isSamsung: true,
      standaloneKbdYaml: samsungLayout.bopomoSamsungYaml,
      trimeCustomYaml: samsungLayout.getSamsungTrimeCustomYaml(),
      bopomoCustomYaml: samsungLayout.getSamsungBopomoCustomYaml(),
      samsungFiles: samsungLayout.getSamsungFilesMap(),
      instructionsText: samsungLayout.getSamsungInstructions()
    };
  }

  const isQwerty = layoutType === 'qwerty';
  const layoutId = isQwerty ? 'bopomo_qwerty' : 'bopomo_standard';

  const standaloneKbdYaml = isQwerty
    ? `name: "洋蔥 QWERTY 注音"
author: "洋蔥 / Trime"
ascii_mode: 0
width: 10
height: 52
keys:
  - {click: "1", label: "1\\nㄅ", width: 9.09}
  - {click: "2", label: "2\\nㄉ", width: 9.09}
  - {click: "3", label: "3\\nˇ", width: 9.09}
  - {click: "4", label: "4\\nˋ", width: 9.09}
  - {click: "5", label: "5\\nㄓ", width: 9.09}
  - {click: "6", label: "6\\nˊ", width: 9.09}
  - {click: "7", label: "7\\n˙", width: 9.09}
  - {click: "8", label: "8\\nㄚ", width: 9.09}
  - {click: "9", label: "9\\nㄞ", width: 9.09}
  - {click: "0", label: "0\\nㄢ", width: 9.09}
  - {click: "-", label: "-\\nㄦ", width: 9.1}
  - {click: "q", label: "Q\\nㄆ"}
  - {click: "w", label: "W\\nㄊ"}
  - {click: "e", label: "E\\nㄍ"}
  - {click: "r", label: "R\\nㄐ"}
  - {click: "t", label: "T\\nㄔ"}
  - {click: "y", label: "Y\\nㄗ"}
  - {click: "u", label: "U\\nㄧ"}
  - {click: "i", label: "I\\nㄛ"}
  - {click: "o", label: "O\\nㄟ"}
  - {click: "p", label: "P\\nㄣ"}
  - {click: "a", label: "A\\nㄇ"}
  - {click: "s", label: "S\\nㄋ"}
  - {click: "d", label: "D\\nㄎ"}
  - {click: "f", label: "F\\nㄑ"}
  - {click: "g", label: "G\\nㄕ"}
  - {click: "h", label: "H\\nㄘ"}
  - {click: "j", label: "J\\nㄨ"}
  - {click: "k", label: "K\\nㄜ"}
  - {click: "l", label: "L\\nㄠ"}
  - {click: ";", label: ";\\nㄤ"}
  - {click: "z", label: "Z\\nㄈ"}
  - {click: "x", label: "X\\nㄌ"}
  - {click: "c", label: "C\\nㄏ"}
  - {click: "v", label: "V\\nㄒ"}
  - {click: "b", label: "B\\nㄖ"}
  - {click: "n", label: "N\\nㄙ"}
  - {click: "m", label: "M\\nㄩ"}
  - {click: ",", label: ",\\nㄝ"}
  - {click: ".", label: ".\\nㄡ"}
  - {click: "/", label: "/\\nㄥ"}
  - {click: Keyboard_symbols, label: "?123", width: 15}
  - {click: Mode_switch, label: "中/英", width: 15}
  - {click: space, label: "空白 ˉ", width: 45}
  - {click: BackSpace, label: "⌫", width: 12.5}
  - {click: Return, label: "換行", width: 12.5}
`
    : `name: "洋蔥傳統注音"
author: "洋蔥 / Trime"
ascii_mode: 0
width: 10
height: 52
keys:
  - {click: "1", label: "ㄅ"}
  - {click: "2", label: "ㄉ"}
  - {click: "3", label: "ˇ"}
  - {click: "4", label: "ˋ"}
  - {click: "5", label: "ㄓ"}
  - {click: "6", label: "ˊ"}
  - {click: "7", label: "˙"}
  - {click: "8", label: "ㄚ"}
  - {click: "9", label: "ㄞ"}
  - {click: "0", label: "ㄢ"}
  - {click: "q", label: "ㄆ"}
  - {click: "w", label: "ㄊ"}
  - {click: "e", label: "ㄍ"}
  - {click: "r", label: "ㄐ"}
  - {click: "t", label: "ㄔ"}
  - {click: "y", label: "ㄗ"}
  - {click: "u", label: "ㄧ"}
  - {click: "i", label: "ㄛ"}
  - {click: "o", label: "ㄟ"}
  - {click: "p", label: "ㄣ"}
  - {click: "a", label: "ㄇ"}
  - {click: "s", label: "ㄋ"}
  - {click: "d", label: "ㄎ"}
  - {click: "f", label: "ㄑ"}
  - {click: "g", label: "ㄕ"}
  - {click: "h", label: "ㄘ"}
  - {click: "j", label: "ㄨ"}
  - {click: "k", label: "ㄜ"}
  - {click: "l", label: "ㄠ"}
  - {click: ";", label: "ㄤ"}
  - {click: "z", label: "ㄈ"}
  - {click: "x", label: "ㄌ"}
  - {click: "c", label: "ㄏ"}
  - {click: "v", label: "ㄒ"}
  - {click: "b", label: "ㄖ"}
  - {click: "n", label: "ㄙ"}
  - {click: "m", label: "ㄩ"}
  - {click: ",", label: "ㄝ"}
  - {click: ".", label: "ㄡ"}
  - {click: "/", label: "ㄥ"}
  - {click: Keyboard_symbols, label: "?123", width: 15}
  - {click: Mode_switch, label: "中/英", width: 12.5}
  - {click: "-", label: "ㄦ", width: 12.5}
  - {click: space, label: "空白 ˉ", width: 35}
  - {click: BackSpace, label: "⌫", width: 12.5}
  - {click: Return, label: "換行", width: 12.5}
`;

  const indentedDef = standaloneKbdYaml
    .trim()
    .split('\n')
    .map(line => '    ' + line)
    .join('\n');

  const trimeCustomYaml = `# Trime 同文輸入法 洋蔥注音客製設定 (${isQwerty ? 'QWERTY 配對注音' : '傳統標準注音'})
patch:
  "style/keyboard": bopomo_onion
  "style/keyboards":
    - bopomo_onion
    - ${layoutId}
    - default
    - number
    - symbols
  "preset_keyboards/bopomo_onion":
${indentedDef}
  "preset_keyboards/${layoutId}":
${indentedDef}
  "preset_keyboards/default":
${indentedDef}
`;

  return {
    layoutId,
    standaloneKbdYaml,
    trimeCustomYaml
  };
}

async function exportTrimePackage({
  layoutType = 'samsung',
  targetZipPath,
  versionSha,
  versionTitle,
  logCallback = () => {}
}) {
  const rimeDir = getRimeDir();
  let sourceDir = rimeDir;
  let tempExtractDir = null;

  const isExplicitLocal = versionSha === 'local';
  const hasSpecificSha = Boolean(versionSha && !isExplicitLocal);

  if (hasSpecificSha) {
    const displayVersion = versionTitle || versionSha.substring(0, 7);
    logCallback(`[1/4] 正在從 GitHub 下載指定版本: ${displayVersion}...`);
    const downloadUrl = `https://github.com/${GITHUB_REPO}/archive/${versionSha}.zip`;
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`無法從 GitHub 下載指定版本 (${res.status} ${res.statusText})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));
    tempExtractDir = path.join(os.tmpdir(), `rime-trime-source-${Date.now()}`);
    zip.extractAllTo(tempExtractDir, true);

    const items = fs.readdirSync(tempExtractDir);
    sourceDir = tempExtractDir;
    if (items.length === 1 && fs.statSync(path.join(tempExtractDir, items[0])).isDirectory()) {
      sourceDir = path.join(tempExtractDir, items[0]);
    }
    logCallback(`[✓] 已取得雲端版本檔案 (${displayVersion})`);
  } else {
    logCallback(`[1/4] 檢查注音方案設定檔來源...`);
    const hasLocalSchema = fs.existsSync(path.join(rimeDir, 'bopomo_onion.schema.yaml'));
    if (hasLocalSchema) {
      logCallback(`[✓] 使用本機現有洋蔥注音設定檔 (${rimeDir})`);
      sourceDir = rimeDir;
    } else {
      logCallback(`本機尚未安裝洋蔥注音，正在從 GitHub 取得最新版本...`);
      const downloadUrl = `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`無法從 GitHub 下載方案: ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const zip = new AdmZip(Buffer.from(arrayBuffer));
      tempExtractDir = path.join(os.tmpdir(), `rime-trime-source-${Date.now()}`);
      zip.extractAllTo(tempExtractDir, true);

      const items = fs.readdirSync(tempExtractDir);
      sourceDir = tempExtractDir;
      if (items.length === 1 && fs.statSync(path.join(tempExtractDir, items[0])).isDirectory()) {
        sourceDir = path.join(tempExtractDir, items[0]);
      }
      logCallback(`[✓] 已取得最新雲端方案設定檔`);
    }
  }

  const layoutDisplayName = layoutType === 'samsung'
    ? '三星 OneUI 旗艦注音'
    : (layoutType === 'qwerty' ? 'QWERTY 配對注音' : '傳統標準注音');

  logCallback(`[2/4] 產生 Trime 注音鍵盤配置 (${layoutDisplayName})...`);
  const layoutInfo = getTrimeLayoutYaml(layoutType);
  const { layoutId, standaloneKbdYaml, trimeCustomYaml } = layoutInfo;

  const bopomoCustomYaml = layoutInfo.bopomoCustomYaml || `# 洋蔥注音 Trime 專用鍵盤指定
patch:
  "style/keyboard": bopomo_onion
  "style/keyboards":
    - bopomo_onion
    - ${layoutId}
    - default
    - number
    - symbols
`;

  const defaultCustomYaml = `# Trime 預設方案列表：強制覆蓋，僅啟用洋蔥注音方案，避免 Trime 尋找缺失的預設方案 (cangjie5, bopomofo 等)
patch:
  schema_list:
    - schema: bopomo_onion
`;

  const defaultYaml = `# Rime 基礎設定檔
config_version: "0.40"

schema_list:
  - schema: bopomo_onion

switcher:
  caption: "〔方案選單〕"
  hotkeys:
    - F4
    - Control+grave
`;

  const instructionsText = layoutInfo.instructionsText || `================================================================
🧅 洋蔥注音 (Rime Onion) Android 同文輸入法 (Trime) 安裝教學
================================================================

感謝使用洋蔥注音 Rime 管理器！
此壓縮包已為您注入 【${layoutDisplayName}】 鍵盤佈局。
請依照以下步驟完成安裝：

【步驟一：傳送 ZIP 至手機】
將此 ZIP 壓縮檔傳送至您的 Android 手機（透過 USB 傳輸線、通訊軟體或雲端硬碟）。

【步驟二：解壓縮並複製至 Trime 的 rime 目錄】
1. 在手機上使用檔案管理工具解壓縮此 ZIP。
2. 將解壓縮出的 rime 資料夾內的所有檔案與資料夾（包含所有 .yaml, .txt, .lua 等），
   直接複製或覆蓋至手機上的 Trime 配置目錄：

   ⚠️ 注意：不同 Android 版本與設定，Trime 的目錄路徑不同：
   - 【Android 11 以上（最常見）】：
     內部儲存空間 > Android > data > com.osfans.trime > files > rime
     （系統完整路徑：/storage/emulated/0/Android/data/com.osfans.trime/files/rime/）
   - 【舊版 Android 或 已開啟「所有檔案管理權限」】：
     內部儲存空間 > rime （即 /sdcard/rime/）

   💡 提示：打開手機上的「同文輸入法」App → 點選「設定」或「主題與檔案」→「檔案目錄」，
   即可確認您的手機目前使用的是哪一個路徑！

【步驟三：清除舊建置快取（重要！）】
若先前曾經部署過或鍵盤仍顯示英文字母，請務必先刪除該 rime 目錄下的「build」資料夾（若有），
確保 Trime 完全重新讀取並編譯最新的鍵盤與注音方案配置。

【步驟四：點擊「重新部署」】
在 Trime App 選單中，點選「重新部署」（Deploy）。
等待出現「重新部署成功」提示。
部署完成後，在任何輸入框點擊開啟輸入法，鍵盤即會直接顯示注音符號（ㄅ ㄆ ㄇ ㄈ ...）！
================================================================
`;

  logCallback(`[3/4] 正在打包整合壓縮檔...`);
  const targetZip = new AdmZip();

  const ignored = new Set([
    '.backups',
    '.git',
    'build',
    'sync',
    '.onion_manager.json',
    'backup-info.json',
    'installation.yaml'
  ]);

  function addFilesToZip(dir, zipSubFolder = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      if (entry.name.endsWith('.userdb')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        addFilesToZip(fullPath, zipSubFolder ? `${zipSubFolder}/${entry.name}` : entry.name);
      } else {
        targetZip.addLocalFile(fullPath, zipSubFolder);
      }
    }
  }

  addFilesToZip(sourceDir, 'rime');

  // Inject Samsung layout files or standard layout files
  if (layoutInfo.isSamsung && layoutInfo.samsungFiles) {
    for (const [filePath, content] of Object.entries(layoutInfo.samsungFiles)) {
      targetZip.addFile(filePath, Buffer.from(content, 'utf-8'));
    }
  } else {
    targetZip.addFile('rime/trime.custom.yaml', Buffer.from(trimeCustomYaml, 'utf-8'));
    targetZip.addFile('rime/tongwenfeng.trime.custom.yaml', Buffer.from(trimeCustomYaml, 'utf-8'));
    targetZip.addFile('rime/tongwenfeng.custom.yaml', Buffer.from(trimeCustomYaml, 'utf-8'));
    targetZip.addFile('rime/bopomo_onion.custom.yaml', Buffer.from(bopomoCustomYaml, 'utf-8'));
    targetZip.addFile('rime/bopomo_onion.yaml', Buffer.from(standaloneKbdYaml, 'utf-8'));
    if (layoutId !== 'bopomo_onion') {
      targetZip.addFile(`rime/${layoutId}.yaml`, Buffer.from(standaloneKbdYaml, 'utf-8'));
    }
    targetZip.addFile('rime/Android手機Trime安裝說明.txt', Buffer.from(instructionsText, 'utf-8'));
    targetZip.addFile('Android手機Trime安裝說明.txt', Buffer.from(instructionsText, 'utf-8'));
  }

  targetZip.addFile('rime/default.custom.yaml', Buffer.from(defaultCustomYaml, 'utf-8'));
  targetZip.addFile('rime/default.yaml', Buffer.from(defaultYaml, 'utf-8'));

  const finalZipPath = targetZipPath || path.join(os.homedir(), 'Downloads', `rime-onion-trime-${layoutType}.zip`);
  const targetDir = path.dirname(finalZipPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  targetZip.writeZip(finalZipPath);

  // Synchronize staging package into trime-editor directory
  const stagingZipPath = path.join(TRIME_EDITOR_DIR, 'staging_package.zip');
  try {
    if (fs.existsSync(TRIME_EDITOR_DIR)) {
      targetZip.writeZip(stagingZipPath);
      logCallback(`[✓] 已自動同步設定檔至 Trime 編輯器暫存包 (${stagingZipPath})`);
    }
  } catch (err) {
    console.warn('Sync to trime-editor dir error:', err);
  }

  latestTrimeZipBuffer = targetZip.toBuffer();

  if (tempExtractDir) {
    try { fs.rmSync(tempExtractDir, { recursive: true, force: true }); } catch (_) {}
  }

  const zipSizeMB = (fs.statSync(finalZipPath).size / (1024 * 1024)).toFixed(1);
  logCallback(`[4/4] 匯出成功！檔案大小: ${zipSizeMB} MB`);
  logCallback(`[🎉] 已儲存至: ${finalZipPath}`);

  return {
    success: true,
    zipPath: finalZipPath,
    zipName: path.basename(finalZipPath),
    sizeMB: zipSizeMB,
    layoutType,
    stagingZipPath: fs.existsSync(stagingZipPath) ? stagingZipPath : null,
    editorUrl: `file://${path.join(TRIME_EDITOR_DIR, 'index.html')}?auto=1`
  };
}

module.exports = {
  getRimeDir,
  getAppVersion,
  getSystemInfo,
  fetchRemoteVersions,
  listBackups,
  createBackup,
  deployVersion,
  deployFromLocal,
  restoreBackup,
  reloadRime,
  findWeaselDeployer,
  checkAppUpdate,
  downloadAndInstallAppUpdate,
  exportTrimePackage,
  exportForTrime: exportTrimePackage,
  getTrimeLayoutYaml,
  findMatchingAsset,
  compareSemver,
  getPlatformName,
  getLatestTrimeZipBuffer,
  getTrimeEditorDir,
  samsungLayout
};
