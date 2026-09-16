const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');

const GITHUB_REPO = 'houtacheng/rime-bopomo-onion-mixed';

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
  };
}

async function fetchRemoteVersions() {
  const headers = {
    'User-Agent': 'Rime-Onion-Manager-Desktop',
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // Check releases first
    const relRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, { headers });
    let releases = [];
    if (relRes.ok) {
      releases = await relRes.json();
    }

    if (releases.length > 0) {
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
    const commitRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=25`, { headers });
    if (!commitRes.ok) {
      throw new Error(`GitHub API 回傳錯誤: ${commitRes.statusText}`);
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

async function reloadRime() {
  const platform = process.platform;
  if (platform === 'darwin') {
    const squirrelPath = '/Library/Input Methods/Squirrel.app/Contents/MacOS/Squirrel';
    if (fs.existsSync(squirrelPath)) {
      try {
        await runCmd(`"${squirrelPath}" --reload`);
        return { success: true, output: 'Squirrel --reload 執行成功' };
      } catch (err) {
        return { success: false, output: err.message };
      }
    }
  } else if (platform === 'win32') {
    // Windows Weasel deployer paths
    const candidates = [
      'C:\\Program Files\\Rime\\weasel-0.16.3\\WeaselDeployer.exe',
      'C:\\Program Files\\Rime\\weasel-0.15.0\\WeaselDeployer.exe',
      'C:\\Program Files (x86)\\Rime\\weasel-0.16.3\\WeaselDeployer.exe',
      'C:\\Program Files (x86)\\Rime\\weasel-0.15.0\\WeaselDeployer.exe'
    ];
    // Dynamic glob could also be used
    for (const exe of candidates) {
      if (fs.existsSync(exe)) {
        try {
          await runCmd(`"${exe}" /deploy`);
          return { success: true, output: 'WeaselDeployer /deploy 執行成功' };
        } catch (e) {
          return { success: false, output: e.message };
        }
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

module.exports = {
  getRimeDir,
  getSystemInfo,
  fetchRemoteVersions,
  listBackups,
  createBackup,
  deployVersion,
  restoreBackup,
  reloadRime,
  getPlatformName
};
