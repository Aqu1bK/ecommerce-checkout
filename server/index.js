require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors()); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecommerce_checkout',
  password: process.env.DB_PASSWORD || 'yourpassword',
  port: process.env.DB_PORT || 5432,
});

// Email transporter (Mailtrap)
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Generate random order number
const generateOrderNumber = () => {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
};

// Routes
app.post('/api/orders', async (req, res) => {
  const { fullName, email, phone, address, city, state, zipCode, cardNumber, expiryDate, cvv, product } = req.body;
  const orderNumber = generateOrderNumber();
  
  // Simulate different transaction outcomes based on CVV
  let status = 'approved';
  let message = 'Payment approved';
  
  if (cvv === '222') {
    status = 'declined';
    message = 'Payment declined by bank';
  } else if (cvv === '333') {
    status = 'failed';
    message = 'Payment gateway error';
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (
        order_number, customer_name, email, phone, address, city, state, zip_code, 
        card_number, expiry_date, cvv, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [orderNumber, fullName, email, phone, address, city, state, zipCode, 
       cardNumber, expiryDate, cvv, status]
    );

    // Insert order item
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, variant, quantity, price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderResult.rows[0].id, product.productId, product.variant, product.quantity, product.price]
    );

    // Update inventory (in a real app)
    // await pool.query('UPDATE products SET inventory = inventory - $1 WHERE id = $2', 
    //   [product.quantity, product.productId]);

    // Commit transaction
    await pool.query('COMMIT');

    // Prepare order data for response
    const orderData = {
      ...orderResult.rows[0],
      product: {
        name: product.name,
        variant: product.variant,
        quantity: product.quantity,
        price: product.price
      }
    };

    // Send email based on status
    await sendConfirmationEmail(orderData);

    res.json({
      status,
      message,
      order: orderData
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest order (for demo purposes)
app.get('/api/orders/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
       json_build_object(
         'name', p.name,
         'variant', oi.variant,
         'quantity', oi.quantity,
         'price', oi.price
       ) as product
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       ORDER BY o.created_at DESC LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email sending function
async function sendConfirmationEmail(order) {
  let subject, text;
  
  if (order.status === 'approved') {
    subject = `Your Order Confirmation - #${order.order_number}`;
    text = `Thank you for your order!
    
Order Number: ${order.order_number}
Product: ${order.product.name} - ${order.product.variant}
Quantity: ${order.product.quantity}
Total: Rs. ${(order.product.price * order.product.quantity).toFixed(2)}

We'll notify you when your order ships.`;
  } else {
    subject = `Payment Issue with Order #${order.order_number}`;
    text = `We encountered an issue processing your payment for order #${order.order_number}.
    
Status: ${order.status === 'declined' ? 'Payment Declined' : 'Payment Gateway Error'}

Please try again or contact support.`;
  }

  const mailOptions = {
    from: '"eCommerce Store" <store@example.com>',
    to: order.email,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
