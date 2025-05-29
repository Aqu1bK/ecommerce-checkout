import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [selectedVariant, setSelectedVariant] = useState('White');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const product = {
    id: 1,
    name: "ADIDAS | KID'S STAN SMITH",
    description: "The Stan Smith owned the tennis court in the '70s. Today it runs the streets with the same clean, classic style. These kids' shoes preserve the iconic look of the original, made in leather with punched 3-strings, heel and tongue logos and lightweight step-in cushioning.",
    price: 90.00,
    variants: ['White', 'Black', 'Blue'],
    imageUrl: "https://assets.adidas.com/images/w_600,f_auto,q_auto/68ae7ea7849b43eca70aac1e00f5146d_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg"
  };

  const handleBuyNow = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      variant: selectedVariant,
      quantity,
      price: product.price
    };
    localStorage.setItem('cart', JSON.stringify(cartItem));
    navigate('/checkout');
  };

  return (
    <div className="landing-page">
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} />
      <p>{product.description}</p>
      <div className="variant-selector">
        <label>Color:</label>
        <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)}>
          {product.variants.map(variant => (
            <option key={variant} value={variant}>{variant}</option>
          ))}
        </select>
      </div>
      <div className="quantity-selector">
        <label>Quantity:</label>
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
      <div className="price">Rs. {(product.price * quantity).toFixed(2)}</div>
      <button className="buy-now" onClick={handleBuyNow}>Buy Now</button>
    </div>
  );
};

export default LandingPage;