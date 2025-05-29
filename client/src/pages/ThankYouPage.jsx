import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ThankYouPage = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else {
      // If page refreshed, fetch from API
      const fetchOrder = async () => {
        try {
          // In a real app, you'd get order ID from URL params
          const response = await axios.get('http://localhost:5000/api/orders/latest');
          setOrder(response.data);
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [location.state]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="thank-you-page">
      <h1>Thank You for Your Order!</h1>
      <p>Your order number is: {order.order_number}</p>
      
      <div className="order-details">
        <h2>Order Summary</h2>
        <p>Product: {order.product.name} - {order.product.variant}</p>
        <p>Quantity: {order.product.quantity}</p>
        <p>Total: Rs. {(order.product.price * order.product.quantity).toFixed(2)}</p>
      </div>
      
      <div className="customer-info">
        <h2>Customer Information</h2>
        <p>Name: {order.customer_name}</p>
        <p>Email: {order.email}</p>
        <p>Phone: {order.phone}</p>
        <p>Address: {order.address}, {order.city}, {order.state} {order.zip_code}</p>
      </div>
      
      <p>A confirmation email has been sent to {order.email}</p>
    </div>
  );
};

export default ThankYouPage;