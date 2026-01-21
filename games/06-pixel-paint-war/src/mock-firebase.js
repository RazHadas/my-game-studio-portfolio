export function getDatabase(app) {
    return { type: 'mock', app };
}

export function ref(db, path) {
    return { path, db };
}

// Helper to read/write entire DB from localStorage
function readDB() {
    const str = localStorage.getItem('pixel_paint_war_db');
    return str ? JSON.parse(str) : {};
}

function writeDB(data) {
    localStorage.setItem('pixel_paint_war_db', JSON.stringify(data));
    // Dispatch local event for current tab
    window.dispatchEvent(new CustomEvent('mock-db-update'));
}

// Helper to access deeply nested object
function startAt(obj, path) {
    if (path === '/' || path === '') return obj;
    const parts = path.split('/');
    let current = obj;
    for (const part of parts) {
        if (current[part] === undefined) {
            current[part] = {};
        }
        current = current[part];
    }
    return current;
}

// Deep set helper
function deepSet(obj, path, value) {
    if (path === '/' || path === '') return value;
    const parts = path.split('/');
    const last = parts.pop();
    let current = obj;
    for (const part of parts) {
        if (current[part] === undefined || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }
    current[last] = value;
    return obj;
}

function getValue(path) {
    const dbData = readDB();
    if (path === '.info/serverTimeOffset') return 0;

    const parts = path.split('/').filter(p => p);
    let current = dbData;
    for (const part of parts) {
        if (current === undefined || current === null) return null;
        current = current[part];
    }
    return current;
}

export async function set(ref, value) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 50));

    // Process value for serverTimestamp
    const processedValue = JSON.parse(JSON.stringify(value));
    if (processedValue && typeof processedValue === 'object') {
        for (const k in processedValue) {
            if (processedValue[k] === 'SERVER_TIMESTAMP_MOCK') {
                processedValue[k] = Date.now();
            }
        }
    }

    const dbData = readDB();
    const newData = deepSet(dbData, ref.path, processedValue);
    writeDB(newData);
}

export async function update(ref, updates) {
    await new Promise(r => setTimeout(r, 50));
    const dbData = readDB();

    // We need to get the node at ref.path first
    // Note: 'update' usually takes specific paths relative to ref
    // But here we'll simplify: we assume updates is a flat object of keys to update under ref

    // First navigate to ref.path
    const parts = ref.path.split('/').filter(p => p);
    let current = dbData;
    // Create path if not exist
    for (let i = 0; i < parts.length; i++) {
        if (current[parts[i]] === undefined || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }

    // Now apply updates
    for (const [key, val] of Object.entries(updates)) {
        let finalVal = val;
        if (val === 'SERVER_TIMESTAMP_MOCK') finalVal = Date.now();
        current[key] = finalVal;
    }

    writeDB(dbData);
}

export async function get(ref) {
    await new Promise(r => setTimeout(r, 50));
    const val = getValue(ref.path);
    return {
        exists: () => val !== null && val !== undefined,
        val: () => val
    };
}

export function onValue(ref, callback) {
    const handler = () => {
        const val = getValue(ref.path);
        callback({
            val: () => val
        });
    };

    // Listen for storage events (other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'pixel_paint_war_db') {
            handler();
        }
    });

    // Listen for local writes (same tab)
    window.addEventListener('mock-db-update', handler);

    // Initial call
    setTimeout(handler, 0);

    // Return unsubscribe (optional, ignoring for simple script)
    return () => { };
}

export function serverTimestamp() {
    return 'SERVER_TIMESTAMP_MOCK';
}
