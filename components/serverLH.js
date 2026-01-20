import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

/* ================= INIT ================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

/* ================= STORAGE CONFIG ================= */

const PREFERRED_DRIVE = 'E:\\';
const FOLDER_NAME = 'ServerLH';
const EXTERNAL_ROOT = path.join(PREFERRED_DRIVE, FOLDER_NAME);
const LOCAL_FALLBACK = path.join(process.cwd(), 'ServerLH_Data');

let ROOT_DIR = LOCAL_FALLBACK;

// Detect & test E:
try {
    if (fs.existsSync(PREFERRED_DRIVE)) {
        if (!fs.existsSync(EXTERNAL_ROOT)) fs.mkdirSync(EXTERNAL_ROOT, { recursive: true });
        const testFile = path.join(EXTERNAL_ROOT, '.test');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
        ROOT_DIR = EXTERNAL_ROOT;
    }
} catch {
    ROOT_DIR = LOCAL_FALLBACK;
}

console.log(`[STORAGE] ROOT = ${ROOT_DIR}`);

const STORAGE_DIRS = [
    'Database','History','GUQ','CVHC','CVHT','BBDC',
    'SALARY','THONGBAO','NGHIDINH','LIBRARY','UPLOADS','CV'
];

const DB_DIR = path.join(ROOT_DIR, 'Database');
const MASTER_FILE = path.join(DB_DIR, 'master_data.json');
const BACKUP_FILE = path.join(DB_DIR, 'backup.json');
const LOCK_FILE = path.join(DB_DIR, '.write.lock');

const MAX_HISTORY_FILES = 3;

/* ================= HELPERS ================= */

const ensureDirectories = () => {
    if (!fs.existsSync(ROOT_DIR)) fs.mkdirSync(ROOT_DIR, { recursive: true });
    STORAGE_DIRS.forEach(d => {
        const p = path.join(ROOT_DIR, d);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
};

const cleanupHistory = (historyDir) => {
    if (!fs.existsSync(historyDir)) return;

    const files = fs.readdirSync(historyDir)
        .map(f => ({
            name: f,
            time: fs.statSync(path.join(historyDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length <= MAX_HISTORY_FILES) return;

    files.slice(MAX_HISTORY_FILES).forEach(f => {
        fs.unlinkSync(path.join(historyDir, f.name));
        console.log(`[HISTORY CLEAN] ${f.name}`);
    });
};

/* ================= DATA ================= */

const INITIAL_DB = {
    users: [],
    statements: [],
    guq: [],
    notifications: [],
    attendanceRecords: [],
    decrees: [],
    carriers: []
};

const readJSONSafe = (file) => {
    if (!fs.existsSync(file)) return null;
    try {
        const raw = fs.readFileSync(file, 'utf8');
        if (!raw.trim()) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const readDB = () => {
    ensureDirectories();

    let data = readJSONSafe(MASTER_FILE);
    if (data) return data;

    console.warn('[RECOVERY] master broken → try backup');

    data = readJSONSafe(BACKUP_FILE);
    if (data) {
        fs.writeFileSync(MASTER_FILE, JSON.stringify(data, null, 2));
        return data;
    }

    fs.writeFileSync(MASTER_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
};

const writeDB = (data, label = 'SYNC', user = 'System') => {
    ensureDirectories();

    if (fs.existsSync(LOCK_FILE)) {
        throw new Error('Hệ thống đang được lưu bởi người khác, vui lòng thử lại.');
    }

    try {
        fs.writeFileSync(LOCK_FILE, Date.now().toString());

        const jsonStr = JSON.stringify(data, null, 2);

        fs.writeFileSync(MASTER_FILE, jsonStr);
        fs.writeFileSync(BACKUP_FILE, jsonStr);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

        const historyDir = path.join(ROOT_DIR, 'History', dateStr);
        if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

        const safeUser = user.replace(/[^a-zA-Z0-9]/g, '');
        const historyFile = path.join(
            historyDir,
            `${dateStr}_${timeStr}_${label}_by_${safeUser}.json`
        );

        fs.writeFileSync(historyFile, jsonStr);
        cleanupHistory(historyDir);

        console.log(`[SAVE] ${label} by ${user}`);
    } finally {
        if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
    }
};

/* ================= MIDDLEWARE ================= */

app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/files', express.static(ROOT_DIR));

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

/* ================= UPLOAD ================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const cat = req.query.category || 'UPLOADS';
        const dir = path.join(ROOT_DIR, cat);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
    }
});

const upload = multer({ storage });

/* ================= ROUTES ================= */

app.get('/', (req, res) => {
    res.send(`Server OK | Storage: ${ROOT_DIR}`);
});

app.get('/api/status', (req, res) => {
    res.json({
        port: PORT,
        root: ROOT_DIR,
        lock: fs.existsSync(LOCK_FILE),
        time: new Date()
    });
});

app.get('/api/data', (req, res) => {
    res.json(readDB());
});

app.post('/api/save', (req, res) => {
    try {
        const user = req.body?.currentUser?.name || 'WebUser';
        writeDB(req.body, 'SYNC', user);
        res.json({ success: true, time: new Date() });
    } catch (e) {
        res.status(409).json({ error: e.message });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    res.json({
        success: true,
        record: {
            id: Date.now(),
            fileName: req.file.filename,
            originalName: req.file.originalname,
            path: `${req.query.category || 'UPLOADS'}/${req.file.filename}`,
            uploadDate: new Date().toISOString().split('T')[0]
        }
    });
});

/* ================= START ================= */

ensureDirectories();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at port ${PORT}`);
});
