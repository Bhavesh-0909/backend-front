import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(() => {
    // Check local storage for existing balance
    const savedBalance = localStorage.getItem('balance');
    return savedBalance ? parseFloat(savedBalance) : 1000; // Default to 1000 if not found
  });
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [userTier] = useState('standard');

  // Update local storage whenever balance changes
  useEffect(() => {
    localStorage.setItem('balance', balance);
  }, [balance]);

  // Updated login function (removed session management)
  const login = async () => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.user) {
        setBalance(data.user.balance);
        fetchProducts(); // Fetch products after login
      } else {
        setMessage('Login failed. Please try again.');
      }
    } catch (err) {
      setMessage('Network error during login. Please try again.');
    }
  };

  // New function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/products');
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setMessage('Failed to fetch products. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/user/balance');
      const data = await response.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
      } else {
        setMessage('Failed to fetch balance.');
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Updated purchase function (removed session management)
  const purchase = async (productId) => {
    const quantity = quantities[productId] || 1;
    
    try {
      const response = await fetch('https://business-back-viyj.onrender.com/api/v2/commerce/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId, 
          quantity: parseInt(quantity)
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

  useEffect(() => {
    fetchBalance();
    fetchProducts();
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
        <button onClick={login} className="login-button">Login</button>
      </div>

      <div className="products-section">
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
                  value={quantities[product.id] || 1}
                  onChange={(e) => setQuantities({
                    ...quantities,
                    [product.id]: e.target.value
                  })}
                />
                <button onClick={() => purchase(product.id)}>
                  Purchase (${(product.basePrice * (1 - product.discount / 100) * (quantities[product.id] || 1)).toFixed(2)})
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