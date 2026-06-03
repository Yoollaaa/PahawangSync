import express from 'express';
import cors from 'cors';
import pkg from 'pg';
<<<<<<< HEAD
import midtransClient from 'midtrans-client';
=======
>>>>>>> dcf4e73999ac28c27f976bc02fe15506ab62595d

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

const serverKey = "Mid-server-QWKNb8k3lHs7d2hYn8dUOM3j";
pool.connect()
  .then(() => console.log('Database PostgreSQL sukses terhubung!'))
  .catch((err) => console.error('Gagal koneksi ke database:', err.stack));

app.post('/api/tokenize', async (req, res) => {
    let grossAmount = req.body?.gross_amount || 1265000;
    const serverKey = "RAHASIA_NEGARA";    
    const authString = Buffer.from(serverKey + ':').toString('base64');
    const randomOrderId = "PHW-" + Math.floor(Math.random() * 1000000);
    const payload = { transaction_details: { order_id: randomOrderId, gross_amount: Number(grossAmount) } };

    try {
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + authString },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.token) res.json({ token: data.token });
        else res.status(400).json({ error: "Ditolak", details: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

<<<<<<< HEAD

=======
>>>>>>> dcf4e73999ac28c27f976bc02fe15506ab62595d
app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

app.post('/api/assets', async (req, res) => {
  const { name, category, price, stock } = req.body;
  const status = Number(stock) > 0 ? 'Tersedia' : 'Habis';
  try {
    const result = await pool.query(
      'INSERT INTO assets (name, category, price, stock, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, Number(price), Number(stock), status]
    );
    res.status(201).json({ message: "Aset ditambahkan!", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal menyimpan aset" });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock } = req.body;
  const status = Number(stock) > 0 ? 'Tersedia' : 'Habis';
  try {
    const result = await pool.query(
      'UPDATE assets SET name = $1, category = $2, price = $3, stock = $4, status = $5 WHERE id = $6 RETURNING *',
      [name, category, Number(price), Number(stock), status, id]
    );
    res.status(200).json({ message: "Aset diupdate!", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengupdate aset" });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    res.status(200).json({ message: "Aset dihapus!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus aset" });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const queryText = `SELECT r.*, a.name as asset_name, a.category as asset_category FROM reservations r JOIN assets a ON r.asset_id = a.id ORDER BY r.booking_date ASC`;
    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil tiket" });
  }
});

app.post('/api/reservations', async (req, res) => {
    const { asset_id, customer_name, booking_date, quantity, total_price } = req.body;
    
    try {
        const queryText = `INSERT INTO reservations (asset_id, customer_name, booking_date, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING *`;
        const result = await pool.query(queryText, [asset_id, customer_name, booking_date, quantity, total_price]);
        
        console.log(`Tiket berhasil disimpan untuk: ${customer_name}`);
        res.status(201).json({ message: "Tiket berhasil diamankan!", data: result.rows[0] });
    } catch (error) {
        console.error("Gagal menyimpan ke database:", error);
        res.status(500).json({ error: "Gagal menyimpan tiket ke database" });
    }
});

=======
    res.status(500).json({ error: "Terjadi kesalahan" });
  }
});

>>>>>>> dcf4e73999ac28c27f976bc02fe15506ab62595d
app.put('/api/reservations/:id/confirm', async (req, res) => {
  try {
    await pool.query("UPDATE reservations SET status = 'Confirmed' WHERE id = $1", [req.params.id]);
    res.status(200).json({ message: "Dikonfirmasi!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal" });
  }
});

app.put('/api/reservations/:id/complete', async (req, res) => {
  try {
    const result = await pool.query("UPDATE reservations SET status = 'Completed' WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Tidak ditemukan!" });
    res.status(200).json({ message: "Selesai!", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal" });
  }
});

<<<<<<< HEAD

=======
>>>>>>> dcf4e73999ac28c27f976bc02fe15506ab62595d
app.get('/api/finance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
    const transactions = result.rows;
    let balance = 0;
    transactions.forEach(t => {
      if (t.type === 'Pemasukan') balance += t.amount;
      else if (t.type === 'Penarikan') balance -= t.amount;
    });
    res.status(200).json({ balance, transactions });
  } catch (error) {
    console.error("Error finance:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/finance/withdraw', async (req, res) => {
  const { amount } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions (type, amount, description) VALUES ('Penarikan', $1, 'Penarikan Saldo Vendor (Withdraw)') RETURNING *", 
      [amount]
    );
    res.status(200).json({ message: "Penarikan sukses!", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal menarik dana" });
  }
});

app.listen(5000, () => console.log('Backend siap di http://localhost:5000'));