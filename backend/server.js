import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/tokenize', async (req, res) => {
    console.log("Menerima request checkout...");
    
    let grossAmount = req.body?.gross_amount || 1265000;

    // Server Key SESUAI SCREENSHOT
const serverKey = "RAHASIA_NEGARA";    
    const authString = Buffer.from(serverKey + ':').toString('base64');
    const randomOrderId = "PHW-" + Math.floor(Math.random() * 1000000);

    const payload = {
        transaction_details: {
            order_id: randomOrderId,
            gross_amount: Number(grossAmount)
        }
    };

    try {
        // URL KEMBALI KE SANDBOX!
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authString
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log("Respon balik dari Midtrans Sandbox:", data);

        if (data.token) {
            res.json({ token: data.token });
        } else {
            res.status(400).json({ error: "Ditolak", details: data });
        }
    } catch (error) {
        console.error("Sistem crash:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('Mini Backend Midtrans siap di http://localhost:5000'));