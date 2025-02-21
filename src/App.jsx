import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(100);
  const [message, setMessage] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [products, setProducts] = useState([
    { id: 1, name: 'Basic Item', basePrice: 50, discount: 0, minimumTier: "standard", stock: 10 },
    { id: 2, name: 'Premium Item', basePrice: 200, discount: 5, minimumTier: "premium", stock: 3 },
  ]);
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [userTier, setUserTier] = useState('standard');
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);
  

  // Login function to get session token
  const login = async () => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setSessionToken(data.token);
      setMessage('Logged in successfully');
      
      // Fetch balance after login
      fetchBalance(data.token);
    } catch (err) {
      setMessage('Failed to login');
    }
  };

  // Fetch user balance
  const fetchBalance = async (token) => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/user/balance', {
        headers: { 'x-session-token': token || sessionToken }
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to fetch balance');
    }
  };

  // Purchase function (triggers potential exploit)
  const purchase = async (productId) => {
    if (!sessionToken) {
      setMessage('Please login first');
      return;
    }

    try {
      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/commerce/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-token': sessionToken
        },
        body: JSON.stringify({ 
          productId, 
          quantity: parseInt(quantity),
          couponCode: couponCode.trim() || undefined
        }),
      });
      
      const data = await response.json();
      
      if (data.flag) {
        setMessage(`🎉 FLAG FOUND: ${data.flag}`);
      } else if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(data.message);
        if (data.newBalance !== undefined) setBalance(data.newBalance);
      }
      
      // Refresh balance after purchase
      fetchBalance();
    } catch (err) {
      setMessage('Failed to purchase item');
    }
  };

  // Toggle hidden products
  const toggleHiddenProducts = () => {
    if (!showHiddenProducts) {
      setProducts([
        ...products,
        { id: 3, name: 'Hidden Item', basePrice: 150, discount: 0, minimumTier: "standard", stock: 1 }
      ]);
    } else {
      setProducts(products.filter(p => p.id !== 3));
    }
    setShowHiddenProducts(!showHiddenProducts);
  };

  // Auto-login on component mount
  useEffect(() => {
    login();
  }, []);

  // Calculate displayed price
  const calculateDisplayPrice = (product) => {
    let price = product.basePrice;
    return price;
  };

  return (
    <div className="app-container">
      <div className="header-banner">
        <h1>Hunter Invantory</h1>
        
      </div>
      
      <div className="riddle-container">
        <div className="riddle-content">
          <h2>The Merchant's Riddle</h2>
          <p>
            "I check what you pay <i>after</i> the discount,<br />
            But limit your purchase based on what's <i>before</i>.<br />
            Find the gap between these two worlds,<br />
            And you'll slip through the door."
          </p>
          
        </div>
      </div>
      
      <div className="user-info">
        <p className="balance">Your Balance: <span>${balance}</span></p>
        <p className="tier">Tier: {userTier}</p>
        <p className="small-note">Transaction Limit: $500</p>
        {!sessionToken ? (
          <button 
            onClick={login}
            className="login-button">
            Login
          </button>
        ) : (
          <p className="session-info">Session: {sessionToken.substring(0,10)}...</p>
        )}
      </div>

      <div className="products-section">
        <div className="products-header">
          <h2>Available Products</h2>
          <button 
            onClick={toggleHiddenProducts}
            className="toggle-products-button">
            {showHiddenProducts ? 'Hide Special Items' : 'Show All Items'}
          </button>
        </div>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className={`product-card ${product.id === 3 ? 'special-product' : ''}`}>
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="price-tag">
                  ${calculateDisplayPrice(product)}
                </span>
              </div>
              
              <p className="product-details">
                Required Tier: {product.minimumTier} • Stock: {product.stock}
              </p>
              
              <div className="purchase-controls">
                <div className="quantity-control">
                  <label>Qty:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                
                <div className="coupon-control">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={() => purchase(product.id)}
                  className="purchase-button">
                  Purchase
                </button>
              </div>
              
              {product.id === 3 && (
                <div className="special-tag">Special Item - Limited Stock</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className={`message-container ${message.includes('FLAG') ? 'flag-found' : ''}`}>
          <p>{message}</p>
        </div>
      )}
      
    </div>
  );
}

export default App;