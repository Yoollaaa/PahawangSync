
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL
);

INSERT INTO assets (name, category, price, stock, status) VALUES
('Villa Cendana', 'Villa', 1500000, 2, 'Tersedia'),
('Perahu Motor 10 Pax', 'Perahu', 800000, 5, 'Tersedia'),
('Set Snorkeling Lengkap', 'Alat', 50000, 0, 'Habis');

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed'
);

INSERT INTO reservations (asset_id, customer_name, booking_date, quantity, status) VALUES
(1, 'Andi Wijaya', '2026-05-25', 1, 'Confirmed'),
(1, 'Siti Rahma', '2026-05-25', 1, 'Confirmed'),
(2, 'Budi Santoso', '2026-05-26', 2, 'Confirmed');

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

INSERT INTO transactions (type, amount, description) VALUES
('Pemasukan', 1500000, 'Pendapatan Sewa Villa Cendana'),
('Pemasukan', 800000, 'Pendapatan Sewa Perahu Motor 10 Pax');