import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [cart, setCart] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const cartItem = JSON.parse(localStorage.getItem('cart'));
    if (!cartItem) {
      navigate('/');
    }
    setCart(cartItem);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Valid card number is required';
    if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Valid expiry date required (MM/YY)';
    if (!formData.cvv || !/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'Valid CVV required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/orders', {
        ...formData,
        product: cart
      });
      
      if (response.data.status === 'approved') {
        navigate('/thank-you', { state: { order: response.data.order }});
      } else {
        alert(`Payment failed: ${response.data.message}`);
      }
    } catch (error) {
      alert('An error occurred during checkout');
    }
  };

  if (!cart) return <div>Loading...</div>;

  return (
    <div className="checkout-page">
      <form onSubmit={handleSubmit}>
        <h2>Contact Information</h2>
        <div>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
          {errors.fullName && <span className="error">{errors.fullName}</span>}
        </div>
        
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        
        <div>
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <h2>Shipping Address</h2>
        <div>
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>
        
        <div>
          <label>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>
        
        <div>
          <label>State</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} />
          {errors.state && <span className="error">{errors.state}</span>}
        </div>
        
        <div>
          <label>Zip Code</label>
          <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
          {errors.zipCode && <span className="error">{errors.zipCode}</span>}
        </div>

        <h2>Payment Information</h2>
        <div>
          <label>Card Number</label>
          <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} />
          {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
        </div>
        
        <div>
          <label>Expiry Date (MM/YY)</label>
          <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
          {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
        </div>
        
        <div>
          <label>CVV</label>
          <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} />
          {errors.cvv && <span className="error">{errors.cvv}</span>}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>{cart.name} - {cart.variant}</p>
          <p>Quantity: {cart.quantity}</p>
          <p>Total: Rs. {(cart.price * cart.quantity).toFixed(2)}</p>
        </div>

        <button type="submit">Complete Purchase</button>
      </form>
    </div>
  );
};

export default CheckoutPage;