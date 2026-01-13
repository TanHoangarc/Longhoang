
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// --- CONFIGURATION ---
// Try to use the requested E:\ drive, but fallback to local folder if not available
const PREFERRED_ROOT = 'E:\\ServerLH';
const FALLBACK_ROOT = path.join(process.cwd(), 'ServerLH_Data');

let ROOT_DIR = PREFERRED_ROOT;

// Directory setup logic with fallback
try {
    // Check if we can write to the preferred root
    if (!fs.existsSync(PREFERRED_ROOT)) {
        // Try creating it. This will throw on Windows if E: drive doesn't exist
        fs.mkdirSync(PREFERRED_ROOT, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(PREFERRED_ROOT, '.test_write');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    console.log(`Using Storage: ${PREFERRED_ROOT}`);
} catch (err) {
    console.warn(`Warning: Cannot access ${PREFERRED_ROOT} (Drive might be missing).`);
    console.warn(`Switching to local fallback: ${FALLBACK_ROOT}`);
    ROOT_DIR = FALLBACK_ROOT;
}

// Define the specific subdirectories required by the system
const STORAGE_DIRS = [
    'Database',     // JSON Data
    'History',      // Backups
    'GUQ',          // Giấy ủy quyền
    'CVHC',         // Công văn hoàn cược
    'CVHT',         // Công văn hoàn tiền
    'BBDC',         // Biên bản điều chỉnh
    'SALARY',       // Đơn xin nghỉ phép / Lương
    'THONGBAO',     // File đính kèm thông báo
    'NGHIDINH',     // Văn bản luật/Nghị định
    'LIBRARY'       // Thư viện mẫu
];

const MASTER_FILE = path.join(ROOT_DIR, 'Database', 'master_data.json');

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- UTILS ---
const ensureDirectories = () => {
    STORAGE_DIRS.forEach(dirName => {
        const dirPath = path.join(ROOT_DIR, dirName);
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`[INIT] Created directory: ${dirPath}`);
            } catch (e) {
                console.error(`[ERROR] Failed to create ${dirPath}:`, e);
            }
        }
    });
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
};

// Initial Data Structure (if file doesn't exist)
const INITIAL_DB = {
  users: [
    { id: 1, name: 'Nguyễn Văn A', englishName: 'Mr. A', role: 'Sales', email: 'sales1@longhoanglogistics.com', password: '123', status: 'Active', failedAttempts: 0, department: 'Sales', position: 'Nhân viên kinh doanh' },
    { id: 7, name: 'Administrator', englishName: 'Admin', role: 'Admin', email: 'admin@longhoanglogistics.com', password: 'admin', status: 'Active', failedAttempts: 0, department: 'Board', position: 'Admin' }
  ],
  statements: [],
  attendanceRecords: [],
  notifications: [],
  carriers: []
};

// Helper: Read Master Data
const readMasterData = () => {
  ensureDirectories();
  if (!fs.existsSync(MASTER_FILE)) {
    // Create fresh DB if not exists
    fs.writeFileSync(MASTER_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(MASTER_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading master file:", err);
    return INITIAL_DB;
  }
};

// Helper: Write Master Data & Create Backup
const writeData = (newData, changeType, userChanged) => {
  ensureDirectories();
  
  // 1. Save to Master (Persistence)
  fs.writeFileSync(MASTER_FILE, JSON.stringify(newData, null, 2));

  // 2. Create Backup (History/Audit)
  // Folder structure: History/YYYY-MM-DD/
  const dateFolder = new Date().toISOString().split('T')[0];
  const targetBackupDir = path.join(ROOT_DIR, 'History', dateFolder);
  if (!fs.existsSync(targetBackupDir)) fs.mkdirSync(targetBackupDir, { recursive: true });

  const safeUser = userChanged ? userChanged.replace(/[^a-z0-9]/gi, '_') : 'SYSTEM';
  const backupFileName = `${getTimestamp()}_${changeType}_by_${safeUser}.json`;
  
  fs.writeFileSync(path.join(targetBackupDir, backupFileName), JSON.stringify(newData, null, 2));
  
  console.log(`[SAVED] ${changeType} updated by ${userChanged}. Backup: ${backupFileName}`);
};

// --- ENDPOINTS ---

// 1. GET INITIAL DATA (Load on startup)
app.get('/api/data', (req, res) => {
  try {
    const data = readMasterData();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// 2. GENERIC SYNC ENDPOINT (Handle concurrency better)
// Clients send { type: 'users', data: [...], user: 'EnglishName' }
app.post('/api/sync', (req, res) => {
  const { type, data, user } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  try {
    // 1. Read latest state from disk (Critical for concurrency)
    const currentDb = readMasterData();

    // 2. Update specific section
    currentDb[type] = data;

    // 3. Write back to disk + Backup
    writeData(currentDb, type.toUpperCase(), user || 'Unknown');

    res.json({ success: true, message: 'Synced successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Write Error' });
  }
});

// 3. SPECIAL: BACKUP MANUAL (For the settings page button)
app.post('/api/backup/manual', (req, res) => {
  const { user, label } = req.body;
  try {
    const currentDb = readMasterData();
    writeData(currentDb, `MANUAL_${label}`, user);
    res.json({ success: true, fileName: `Manual Backup created` });
  } catch (e) {
    res.status(500).json({ error: 'Backup failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` LOGISTICS SERVER RUNNING ON PORT ${PORT}`);
  console.log(` Storage Root: ${ROOT_DIR}`);
  console.log(` Folders Created: ${STORAGE_DIRS.join(', ')}`);
  console.log(`==================================================`);
  ensureDirectories();
});
