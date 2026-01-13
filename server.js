
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// --- CONFIGURATION ---
// Try to use the requested E:\ drive, but fallback to local folder if not available
const PREFERRED_ROOT = 'E:\\ServerLH';
const FALLBACK_ROOT = path.join(process.cwd(), 'ServerLH_Data');

let ROOT_DIR = FALLBACK_ROOT;

try {
    // Simple check if path starts with E:\ and we are on Windows (or environment that supports it)
    if (fs.existsSync('E:\\')) {
        if (!fs.existsSync(PREFERRED_ROOT)) {
            fs.mkdirSync(PREFERRED_ROOT, { recursive: true });
        }
        // Test write
        const testFile = path.join(PREFERRED_ROOT, '.test_write');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
        ROOT_DIR = PREFERRED_ROOT;
        console.log(`[STORAGE] Using Preferred Root: ${ROOT_DIR}`);
    } else {
        console.log(`[STORAGE] E: drive not found. Using Fallback: ${ROOT_DIR}`);
    }
} catch (err) {
    console.warn(`[STORAGE] Warning: Cannot access ${PREFERRED_ROOT}. Error: ${err.message}`);
    console.warn(`[STORAGE] Switching to local fallback: ${ROOT_DIR}`);
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

// --- MULTER STORAGE CONFIG ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on 'category' in QUERY param (safe for multer)
    const category = req.query.category || 'GUQ'; 
    
    // Sanitize category to prevent directory traversal
    const safeCategory = category.toString().replace(/[^a-zA-Z0-9_]/g, '');
    const targetDir = path.join(ROOT_DIR, safeCategory);
    
    if (!fs.existsSync(targetDir)){
        fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Prevent filename collisions and keep extension
    // Format: YYYYMMDD_OriginalName
    // Sanitize original name
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
    cb(null, `${datePrefix}_${safeName}`);
  }
});

const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

// Initial Data Structure
const INITIAL_DB = {
  users: [
    { id: 1, name: 'Nguyễn Văn A', englishName: 'Mr. A', role: 'Sales', email: 'sales1@longhoanglogistics.com', password: '123', status: 'Active', failedAttempts: 0, department: 'Sales', position: 'Nhân viên kinh doanh' },
    { id: 7, name: 'Administrator', englishName: 'Admin', role: 'Admin', email: 'admin@longhoanglogistics.com', password: 'admin', status: 'Active', failedAttempts: 0, department: 'Board', position: 'Admin' }
  ],
  statements: [],
  attendanceRecords: [],
  notifications: [],
  carriers: [],
  guq: []
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
  
  // 1. Save to Master
  fs.writeFileSync(MASTER_FILE, JSON.stringify(newData, null, 2));

  // 2. Create Backup
  const dateFolder = new Date().toISOString().split('T')[0];
  const targetBackupDir = path.join(ROOT_DIR, 'History', dateFolder);
  if (!fs.existsSync(targetBackupDir)) fs.mkdirSync(targetBackupDir, { recursive: true });

  const safeUser = userChanged ? userChanged.replace(/[^a-z0-9]/gi, '_') : 'SYSTEM';
  const backupFileName = `${getTimestamp()}_${changeType}_by_${safeUser}.json`;
  
  fs.writeFileSync(path.join(targetBackupDir, backupFileName), JSON.stringify(newData, null, 2));
  
  console.log(`[SAVED] ${changeType} updated by ${userChanged}. Backup: ${backupFileName}`);
};

// --- ENDPOINTS ---

// Health Check
app.get('/', (req, res) => {
    res.send('Long Hoang Logistics Server is Running');
});

// 1. GET INITIAL DATA
app.get('/api/data', (req, res) => {
  try {
    const data = readMasterData();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// 2. GENERIC SYNC ENDPOINT
app.post('/api/sync', (req, res) => {
  const { type, data, user } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  try {
    const currentDb = readMasterData();
    currentDb[type] = data;
    writeData(currentDb, type.toUpperCase(), user || 'Unknown');
    res.json({ success: true, message: 'Synced successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Write Error' });
  }
});

// 3. FILE UPLOAD
// Accepts 'file' and query 'category'. Metadata in 'metadata' body field.
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const category = req.query.category || 'GUQ';
        const user = req.body.user || 'Unknown';
        
        let metadata = {};
        if (req.body.metadata) {
            try {
                metadata = JSON.parse(req.body.metadata);
            } catch (e) {
                console.warn("Invalid metadata JSON");
            }
        }

        const newRecord = {
            id: Date.now(),
            ...metadata,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            path: `${category}/${req.file.filename}`,
            uploadDate: new Date().toISOString().split('T')[0]
        };

        const db = readMasterData();
        
        if (category === 'GUQ') {
            if (!db.guq) db.guq = [];
            db.guq.push(newRecord);
            writeData(db, 'UPLOAD_GUQ', user);
        }

        res.json({ success: true, record: newRecord });

    } catch (e) {
        console.error("Upload Error:", e);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 4. MANUAL BACKUP
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(` LOGISTICS SERVER RUNNING ON PORT ${PORT}`);
  console.log(` Storage Root: ${ROOT_DIR}`);
  console.log(`==================================================`);
  ensureDirectories();
});
