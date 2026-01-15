
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

/* ================= STORAGE ================= */

const PREFERRED_DRIVE = 'E:\\';
const FOLDER_NAME = 'ServerLH';
const EXTERNAL_ROOT = path.join(PREFERRED_DRIVE, FOLDER_NAME);
const LOCAL_FALLBACK = path.join(process.cwd(), 'ServerLH_Data');

let ROOT_DIR = LOCAL_FALLBACK;

// Kiểm tra ổ đĩa E:
try {
    if (fs.existsSync(PREFERRED_DRIVE)) {
        if (!fs.existsSync(EXTERNAL_ROOT)) fs.mkdirSync(EXTERNAL_ROOT, { recursive: true });
        // Test write permission
        const testFile = path.join(EXTERNAL_ROOT, '.test');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
        ROOT_DIR = EXTERNAL_ROOT;
    }
} catch (e) {
    console.warn(`[STORAGE] Drive E: not writable, using fallback. Error: ${e.message}`);
    ROOT_DIR = LOCAL_FALLBACK;
}

console.log(`[STORAGE] Root Directory = ${ROOT_DIR}`);

const STORAGE_DIRS = [
    'Database','History','GUQ','CVHC','CVHT','BBDC',
    'SALARY','THONGBAO','NGHIDINH','LIBRARY','UPLOADS','CV'
];

const DB_DIR = path.join(ROOT_DIR, 'Database');
const MASTER_FILE = path.join(DB_DIR, 'master_data.json');

const ensureDirectories = () => {
    if (!fs.existsSync(ROOT_DIR)) fs.mkdirSync(ROOT_DIR, { recursive: true });
    STORAGE_DIRS.forEach(d => {
        const p = path.join(ROOT_DIR, d);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
};

/* ================= MIDDLEWARE ================= */

app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files from ROOT_DIR
app.use('/files', express.static(ROOT_DIR));

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

/* ================= DATA HANDLERS ================= */

const INITIAL_DB = { 
    users: [], 
    statements: [], 
    guq: [], 
    notifications: [], 
    attendanceRecords: [],
    decrees: [],
    carriers: []
};

const readDB = () => {
    ensureDirectories();
    
    // Helper to safely read JSON
    const tryReadFile = (filePath) => {
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                // Ensure it's not empty
                if (!raw || raw.trim() === '') return null;
                return JSON.parse(raw);
            } catch (e) {
                console.error(`[READ ERROR] Failed to read ${filePath}:`, e.message);
                return null;
            }
        }
        return null;
    };

    // 1. Try reading Master File
    let data = tryReadFile(MASTER_FILE);
    if (data) {
        console.log(`[READ] Loaded data from ${MASTER_FILE}`);
        return data;
    }

    console.warn("[WARN] Master file missing or corrupt. Attempting restore from Backup...");

    // 2. Try reading Backup File
    const backupFile = path.join(DB_DIR, 'backup.json');
    data = tryReadFile(backupFile);
    if (data) {
        console.log(`[RECOVERY] Recovered data from ${backupFile}`);
        // Optionally restore master file immediately
        try {
            fs.writeFileSync(MASTER_FILE, JSON.stringify(data, null, 2));
            console.log("[RECOVERY] Restored master_data.json from backup.");
        } catch (e) {
            console.error("[RECOVERY WARN] Could not write restored data to master file.");
        }
        return data;
    }

    // 3. Fallback to Initial
    console.warn("[WARN] No valid data found. Returning Initial Defaults.");
    // Create new master file if it doesn't exist
    if (!fs.existsSync(MASTER_FILE)) {
        fs.writeFileSync(MASTER_FILE, JSON.stringify(INITIAL_DB, null, 2));
    }
    return INITIAL_DB;
};

const writeDB = (data, label = 'AUTO', user = 'System') => {
    ensureDirectories();
    const jsonStr = JSON.stringify(data, null, 2);
    
    // 1. Write to Master File
    try {
        fs.writeFileSync(MASTER_FILE, jsonStr);
    } catch (e) {
        console.error("[WRITE ERROR] Could not write to master file:", e);
    }
    
    // 2. Write to Backup File (Quick Restore)
    try {
        fs.writeFileSync(path.join(DB_DIR, 'backup.json'), jsonStr);
    } catch (e) {
        console.error("[WRITE ERROR] Could not write to backup file:", e);
    }

    // 3. Write to History File (Timeline)
    try {
        const dateObj = new Date();
        const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
        // Format time for filename safe string: HH-MM-SS
        const timeStr = dateObj.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        const historyDir = path.join(ROOT_DIR, 'History', dateStr);
        if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });
        
        // Clean user name for filename
        const safeUser = user.replace(/[^a-zA-Z0-9]/g, '');
        const historyFile = path.join(historyDir, `${dateStr}_${timeStr}_${label}_by_${safeUser}.json`);
        
        fs.writeFileSync(historyFile, jsonStr);
    } catch (histError) {
        console.error("Error writing history:", histError);
    }
    
    console.log(`[SAVE] Data saved to ${MASTER_FILE} & History | Trigger: ${label}`);
};

/* ================= UPLOAD CONFIG ================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const cat = req.query.category || 'UPLOADS';
        const dir = path.join(ROOT_DIR, cat);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Safe filename with timestamp
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
    }
});
const upload = multer({ storage });

/* ================= ROUTES ================= */

app.get('/', (req, res) => {
    res.send(`Server Running. Data Location: ${ROOT_DIR}`);
});

// Status check
app.get('/api/status', (req, res) => {
    res.json({ port: PORT, root: ROOT_DIR, time: new Date() });
});

// Load Data (Read)
app.get('/api/data', (req, res) => {
    const data = readDB();
    res.json(data);
});

// Save Data (Write) - Using standard /api/save
app.post('/api/save', (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: 'No data' });
        
        ensureDirectories();
        // Extract user info if available in request (optional optimization)
        const user = req.body.currentUser?.name || 'WebUser';
        writeDB(req.body, 'SYNC', user);
        
        res.json({ success: true, savedAt: new Date() });
    } catch (e) {
        console.error("Save Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Upload File
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    console.log(`[UPLOAD] Saved ${req.file.filename} to ${req.file.destination}`);
    
    // Return record structure needed by frontend
    const newRecord = {
        id: Date.now(),
        fileName: req.file.filename,
        originalName: req.file.originalname,
        path: `${req.query.category || 'UPLOADS'}/${req.file.filename}`,
        uploadDate: new Date().toISOString().split('T')[0],
        // Parse metadata if sent
        ...(req.body.metadata ? JSON.parse(req.body.metadata) : {})
    };

    res.json({ success: true, record: newRecord });
});

/* ================= START ================= */

ensureDirectories();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Active Storage Root: ${ROOT_DIR}`);
});
