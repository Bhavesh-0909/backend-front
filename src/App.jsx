import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(1000);
  const [message, setMessage] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [products, setProducts] = useState([
    { id: 1, name: 'Basic Item', basePrice: 50, discount: 0, minimumTier: "standard", stock: 10 },
    { id: 2, name: 'Premium Item', basePrice: 200, discount: 5, minimumTier: "premium", stock: 3 },
  ]);
  const [quantities, setQuantities] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [userTier, setUserTier] = useState('standard');
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);
  const [transactionLimit] = useState(500);

  // Improved login function
  const login = async () => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("sessionToken", data.token);
        setSessionToken(data.token);
        setBalance(data.user.balance);
        setUserTier(data.user.tier);
      } else {
        setMessage('Login failed. Please try again.');
      }
    } catch (err) {
      setMessage('Network error during login. Please try again.');
    }
  };

  // Improved balance fetch
  const fetchBalance = async () => {
    try {
      const token = sessionToken || localStorage.getItem("sessionToken");
      if (!token) return;

      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/user/balance', {
        headers: { 'x-session-token': token }
      });
      const data = await response.json();
      setBalance(data.balance);
      setUserTier(data.tier);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Improved purchase function
  const purchase = async (productId) => {
    if (!sessionToken) {
      setMessage('Please login first');
      return;
    }

    const quantity = quantities[productId] || 1;
    
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
        setMessage(`🎉 Congratulations! Flag found: ${data.flag}`);
      } else if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(data.message);
        setBalance(data.newBalance);
      }
    } catch (err) {
      setMessage('Failed to process purchase. Please try again.');
    }
  };

  // Toggle hidden products with improved handling
  const toggleHiddenProducts = () => {
    if (!showHiddenProducts) {
      setProducts(prev => [...prev, 
        { id: 3, name: 'Hidden Item', basePrice: 150, discount: 0, minimumTier: "standard", stock: 5 }
      ]);
    } else {
      setProducts(prev => prev.filter(p => p.id !== 3));
    }
    setShowHiddenProducts(!showHiddenProducts);
  };

  // Calculate final price with discounts
  const calculateFinalPrice = (product, quantity = 1) => {
    let price = product.basePrice * quantity;
    if (product.discount > 0) {
      price = price * (1 - product.discount / 100);
    }
    return price.toFixed(2);
  };

  // Initialize on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("sessionToken");
    if (savedToken) {
      setSessionToken(savedToken);
      fetchBalance();
    } else {
      login();
    }
  }, []);

  return (
    <div className="app-container">
      <div className="header-banner">
        <h1>Hunter's Shop Challenge</h1>
      </div>
      
      <div className="riddle-container">
        <div className="riddle-content">
          <h2>The Merchant's Riddle</h2>
          <p>
            "Find the hidden item in my store,<br />
            Stay within the limits, nothing more.<br />
            A special flag awaits the wise,<br />
            Who can see through my disguise."
          </p>
        </div>
      </div>
      
      <div className="user-info">
        <p className="balance">Balance: ${balance}</p>
        <p className="tier">Tier: {userTier}</p>
        <p className="transaction-limit">Transaction Limit: ${transactionLimit}</p>
        {!sessionToken ? (
          <button onClick={login} className="login-button">Login</button>
        ) : (
          <p className="session-info">Session Active</p>
        )}
      </div>

      <div className="products-section">
        <div className="products-header">
          <h2>Available Products</h2>
          <button onClick={toggleHiddenProducts} className="toggle-button">
            {showHiddenProducts ? 'Hide Special Items' : 'Show All Items'}
          </button>
        </div>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>Base Price: ${product.basePrice}</p>
              <p>Stock: {product.stock}</p>
              {product.discount > 0 && (
                <p>Discount: {product.discount}%</p>
              )}
              <div className="purchase-controls">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantities[product.id] || 1}
                  onChange={(e) => setQuantities({
                    ...quantities,
                    [product.id]: e.target.value
                  })}
                />
                <button onClick={() => purchase(product.id)}>
                  Purchase (${calculateFinalPrice(product, quantities[product.id] || 1)})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className={`message-box ${message.includes('Flag') ? 'flag-message' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;