import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import midtransClient from 'midtrans-client';

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pahawang_sync',
  password: 'Febby123', 
  port: 5432,
});

pool.connect()
  .then(() => console.log('Database PostgreSQL sukses terhubung!'))
  .catch((err) => console.error('Gagal koneksi ke database:', err.stack));


app.post('/api/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
    }
    await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone, password, role || 'wisatawan']
    );
    res.status(201).json({ message: 'Pendaftaran sukses!' });
  } catch (error) {
    console.error("Error register:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(401).json({ message: 'Email atau password salah!' });
    }
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});


app.post('/api/tokenize', async (req, res) => {
    try {
        let snap = new midtransClient.Snap({
            isProduction : false, 
            serverKey : 'Mid-server-QWKNb8k3lHs7d2hYn8dUOM3j',
            clientKey : 'Mid-client-G7pClpk5aTmeFySZ'
        });
        let grossAmount = req.body?.gross_amount || 1515000;
        let currentOrderId = req.body?.order_id || "PHW-" + Date.now();
        let parameter = { "transaction_details": { "order_id": currentOrderId, "gross_amount": Number(grossAmount) } };
        const transaction = await snap.createTransaction(parameter);
        res.status(200).json({ token: transaction.token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/assets', async (req, res) => {
  try { const result = await pool.query('SELECT * FROM assets ORDER BY id ASC'); res.status(200).json(result.rows); }
  catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.post('/api/assets', async (req, res) => {
  const { name, category, price, stock, image_url, description } = req.body; 
  const status = Number(stock) > 0 ? 'Tersedia' : 'Habis';
  try {
    const result = await pool.query(
      'INSERT INTO assets (name, category, price, stock, status, image_url, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, category, Number(price), Number(stock), status, image_url, description] 
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.put('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, image_url, description } = req.body; 
  const status = Number(stock) > 0 ? 'Tersedia' : 'Habis';
  try {
    const result = await pool.query(
      'UPDATE assets SET name = $1, category = $2, price = $3, stock = $4, status = $5, image_url = $6, description = $7 WHERE id = $8 RETURNING *',
      [name, category, Number(price), Number(stock), status, image_url, description, id] 
    );
    res.status(200).json({ data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.delete('/api/assets/:id', async (req, res) => {
  try { await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]); res.status(200).json({ message: "OK" }); }
  catch (error) { res.status(500).json({ error: "Gagal" }); }
});


app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query(`SELECT r.*, a.name as asset_name, a.category as asset_category FROM reservations r JOIN assets a ON r.asset_id = a.id ORDER BY r.booking_date ASC`);
    res.status(200).json(result.rows);
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.post('/api/reservations', async (req, res) => {
    const { asset_id, customer_name, booking_date, quantity, total_price, order_id } = req.body; 
    try {
        const result = await pool.query(`INSERT INTO reservations (asset_id, customer_name, booking_date, quantity, total_price, status, order_id) VALUES ($1, $2, $3, $4, $5, 'Pending', $6) RETURNING *`, [asset_id, customer_name, booking_date, quantity, total_price, order_id]);
        await pool.query(`INSERT INTO transactions (type, amount, description) VALUES ('Pemasukan', $1, $2)`, [total_price, `Tiket: ${customer_name}`]);
        res.status(201).json({ data: result.rows[0] });
    } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.put('/api/reservations/:id/confirm', async (req, res) => {
  try { await pool.query("UPDATE reservations SET status = 'Confirmed' WHERE id = $1", [req.params.id]); res.status(200).json({ message: "OK" }); }
  catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.put('/api/reservations/:id/complete', async (req, res) => {
  try {
    const result = await pool.query("UPDATE reservations SET status = 'Completed' WHERE order_id = $1 RETURNING *", [req.params.id]);
    res.status(200).json({ data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});


app.get('/api/finance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
    const transactions = result.rows;
    let balance = 0;
    transactions.forEach(t => { if (t.type === 'Pemasukan') balance += t.amount; else if (t.type === 'Penarikan') balance -= t.amount; });
    res.status(200).json({ balance, transactions });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.post('/api/finance/withdraw', async (req, res) => {
  const { amount } = req.body;
  try {
    await pool.query("INSERT INTO transactions (type, amount, description) VALUES ('Penarikan', $1, 'Withdraw')", [amount]);
    res.status(200).json({ message: "OK" });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const revenueQuery = await pool.query("SELECT SUM(amount) as total_revenue FROM transactions WHERE type = 'Pemasukan'");
    const guestQuery = await pool.query("SELECT SUM(quantity) as total_guests FROM reservations WHERE booking_date = CURRENT_DATE AND status IN ('Confirmed', 'Completed')");
    res.status(200).json({ 
      revenue: Number(revenueQuery.rows[0].total_revenue || 0), 
      guestsToday: Number(guestQuery.rows[0].total_guests || 0) 
    });
  } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.listen(5000, () => console.log('Backend siap di http://localhost:5000'));