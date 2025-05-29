-- 1. Create tables

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  inventory INT NOT NULL
);

-- 2. Order details
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  card_number VARCHAR(20) NOT NULL,
  expiry_date VARCHAR(10) NOT NULL,
  cvv VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Set up relationships
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  variant VARCHAR(50),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- 4. Insert sample products
INSERT INTO products (name, description, price, image_url, inventory) VALUES
('ADIDAS | KID''S STAN SMITH', 'Classic kids shoes', 90.00, 'https://example.com/shoe1.jpg', 100),
('ADIDAS | CLASSIC BACKPACK', 'Stylish backpack', 70.00, 'https://example.com/backpack.jpg', 50),
('ADIDAS | SUPERSTAR 805', 'Comfortable sneakers', 170.00, 'https://example.com/sneakers.jpg', 75);