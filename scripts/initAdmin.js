const http = require('http');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const options = {
    hostname: 'localhost',
    port,
    path: '/api/admin/init',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
        console.log(`init-admin: status ${res.statusCode}`);
        if (data) console.log('response:', data);
        process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);
    });
});

req.on('error', (err) => {
    console.error('init-admin error:', err.message);
    process.exit(1);
});

req.end();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Aborting init-admin.');
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

(async () => {
  try {
    console.log('init-admin: connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      // keep defaults; adjust options if needed
      serverSelectionTimeoutMS: 5000,
    });

    console.log('init-admin: connected to MongoDB');

    const existing = await Admin.findOne({ username: ADMIN_USER }).lean();
    if (existing) {
      console.log(`init-admin: admin '${ADMIN_USER}' already exists; no changes made.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = new Admin({ username: ADMIN_USER, password: ADMIN_PASS });
    await admin.save();
    console.log(`init-admin: created admin '${ADMIN_USER}'`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('init-admin: error', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
})();