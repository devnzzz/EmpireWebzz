const { MongoClient } = require('mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, msg: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: 'Username & password harus diisi!' });
  }

  let client;
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('webzempire');
    const user = await db.collection('users').findOne({ username: username, password: password });

    if (!user) {
      return res.status(401).json({ ok: false, msg: 'Gagal! Pencet Get Akses Agr Bisa Masuk Web Nya' });
    }

    const now = new Date();
    const expired = new Date(user.expired);

    if (expired < now) {
      return res.status(401).json({ ok: false, msg: 'Akses lo udah expired! Hubungi admin.' });
    }

    return res.status(200).json({ ok: true, msg: 'Berhasil Login. Welcome ' + user.username });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ ok: false, msg: 'Server error: ' + err.message });
  } finally {
    if (client) await client.close();
  }
}
