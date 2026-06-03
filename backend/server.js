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

app.post('/api/tokenize', async (req, res) => {
    try {
        let snap = new midtransClient.Snap({
            isProduction : false, 
            serverKey : 'Mid-server-QWKNb8k3lHs7d2hYn8dUOM3j',
            clientKey : 'Mid-client-G7pClpk5aTmeFySZ'
        });

        let grossAmount = req.body?.gross_amount || 1515000;
        let currentOrderId = req.body?.order_id || "PHW-" + Date.now();

        let parameter = {
            "transaction_details": {
                "order_id": currentOrderId,
                "gross_amount": Number(grossAmount)
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
        console.log("Token berhasil didapat:", transaction.token);
        res.status(200).json({ token: transaction.token });

    } catch (error) {
        console.error("Error Midtrans:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY id ASC'); 
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data aset" });
  }
});

app.post('/api/assets', async (req, res) => {
  const { name, category, price, stock, image_url, description } = req.body; 
  
  const status = Number(stock) > 0 ? 'Tersedia' : 'Habis';
  
  try {
    const result = await pool.query(
      'INSERT INTO assets (name, category, price, stock, status, image_url, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, category, Number(price), Number(stock), status, image_url, description] 
    );
    res.status(201).json({ message: "Aset ditambahkan!", data: result.rows[0] });
  } catch (error) {
    console.error("Error saving asset:", error); 
    res.status(500).json({ error: "Gagal menyimpan aset" });
  }
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
    res.status(200).json({ message: "Aset diupdate!", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating asset:", error);
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
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil tiket" });
  }
});

app.post('/api/reservations', async (req, res) => {
    const { asset_id, customer_name, booking_date, quantity, total_price, order_id } = req.body; 
    
    try {
        const queryText = `INSERT INTO reservations (asset_id, customer_name, booking_date, quantity, total_price, status, order_id) VALUES ($1, $2, $3, $4, $5, 'Pending', $6) RETURNING *`;
        const result = await pool.query(queryText, [asset_id, customer_name, booking_date, quantity, total_price, order_id]);
        
        const deskripsiPemasukan = `Pendapatan tiket wisata dari: ${customer_name} (ID: ${order_id})`;
        await pool.query(
            `INSERT INTO transactions (type, amount, description) VALUES ('Pemasukan', $1, $2)`,
            [total_price, deskripsiPemasukan]
        );

        console.log(`Tiket dan Keuangan berhasil dicatat untuk: ${customer_name}`);
        res.status(201).json({ message: "Tiket dan Keuangan berhasil diamankan!", data: result.rows[0] });
    } catch (error) {
        console.error("Gagal menyimpan ke database:", error);
        res.status(500).json({ error: "Gagal menyimpan data ke database" });
    }
});

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
    const result = await pool.query(
      "UPDATE reservations SET status = 'Completed' WHERE order_id = $1 RETURNING *", 
      [req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tiket tidak ditemukan!" });
    }
    
    res.status(200).json({ message: "Selesai!", data: result.rows[0] });
  } catch (error) {
    console.error("Error validasi tiket:", error);
    res.status(500).json({ error: "Gagal memproses validasi" });
  }
});

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

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const revenueQuery = await pool.query(
      "SELECT SUM(amount) as total_revenue FROM transactions WHERE type = 'Pemasukan'"
    );
    const revenue = revenueQuery.rows[0].total_revenue || 0;

    const guestQuery = await pool.query(
      "SELECT SUM(quantity) as total_guests FROM reservations WHERE booking_date = CURRENT_DATE AND status IN ('Confirmed', 'Completed')"
    );
    const guestsToday = guestQuery.rows[0].total_guests || 0;

    res.status(200).json({ 
      revenue: Number(revenue), 
      guestsToday: Number(guestsToday) 
    });
  } catch (error) {
    console.error("Error mengambil statistik dashboard:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

app.listen(5000, () => console.log('Backend siap di http://localhost:5000'));