import { useState, useEffect } from 'react';
import auth, { db } from "../firebase-config"; // นำเข้า Firebase
import { collection, addDoc, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../styles/Merchandise.css';
import qr from '../images/qr.jpg';
import { useNavigate } from 'react-router-dom';  // นำเข้า useNavigate
import emailjs from 'emailjs-com';
import Swal from "sweetalert2";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

import store1 from '../images/Merchandise/IMG_2930.jpg';
import store2 from '../images/Merchandise/IMG_2931.jpg';
import store3 from '../images/Merchandise/IMG_2943.jpg';
import store4 from '../images/Merchandise/IMG_2944.jpg';
import store5 from '../images/Merchandise/IMG_2945.jpg';

// สร้าง CSS แบบ Global
const GlobalStyle = () => {
  return (
    <style>
      {`
        :root {
          --primary: #8B1D1D;
          --primaryLight: #a83030;
          --primaryDark: #6a1717;
          --secondary: #f5f5f5;
          --accent: #FFD700;
          --textLight: #ffffff;
          --textDark: #333333;
          --grayLight: #eaeaea;
          --grayMedium: #cccccc;
          --shadow: rgba(0, 0, 0, 0.1);
          --statusReserved: #FF8C00;
          --statusConfirmed: #28a745;
          --statusCancelled: #dc3545;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Kanit', 'Prompt', sans-serif;
        }
        
        body {
          background-color: var(--secondary);
          color: var(--textDark);
        }
        
        a {
          text-decoration: none;
          color: inherit;
        }
        
        button {
          cursor: pointer;
          border: none;
          outline: none;
        }
      `}
    </style>
  );
};

// ข้อมูลสินค้าตัวอย่าง
const initialProducts = [
  {
    id: 1,
    name: "Kharusart Jersey",
    description: "Jersey in KMUTNB GAMES 2024",
    price: 350,
    image: store1,
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "T-Shirt"
  },
  {
    id: 2,
    name: "Giraffe Game 2024 T-Shirt",
    description: "Giraffe Game 2024 T-Shirt",
    price: 350,
    image: store2,
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "T-Shirt"
  },
  {
    id: 3,
    name: "Freshman 2024 T-Shirt",
    description: "Freshman 2024 T-Shirt",
    price: 390,
    image: store3,
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "T-Shirt"
  },
  {
    id: 4,
    name: "Freshman 2022 T-Shirt",
    description: "Freshman 2022 T-Shirt",
    price: 390,
    image: store4,
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "T-Shirt"
  },
  {
    id: 5,
    name: "SIETHIEN Jersey",
    description: "SIETHIEN Jersey",
    price: 390,
    image: store5,
    sizes: ["S", "M", "L", "XL"],
    category: "T-Shirt"
  }
];

// Component หลัก
function Merchandise() {
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  // เรียกใช้งาน useNavigate
  const [fileSelected, setFileSelected] = useState(false);

  const currentUser = auth.currentUser; // ดึงข้อมูลผู้ใช้ที่ล็อกอิน
  
  // ดึงข้อมูลผู้ใช้จาก Firebase เมื่อ component โหลด
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          setIsLoading(true);
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // ฟังก์ชันสำหรับเพิ่มสินค้าลงตะกร้า
  const addToCart = (product, size, quantity) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity,
      image: product.image
    };
    
    // ตรวจสอบว่ามีสินค้าชิ้นเดียวกันในตะกร้าหรือไม่
    const existingItemIndex = cart.findIndex(
      item => item.id === product.id && item.size === size
    );
    
    if (existingItemIndex >= 0) {
      // ถ้ามีสินค้าอยู่แล้วให้เพิ่มจำนวน
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // ถ้ายังไม่มีให้เพิ่มสินค้าใหม่
      setCart([...cart, cartItem]);
    }
    
    // แสดงข้อความแจ้งเตือน
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `Add ${product.name} (${size}) Quantity ${quantity} pieces Added to cart`;
    document.body.appendChild(notification);
    
    // ลบข้อความแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };
  
  // ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };
  
  // ฟังก์ชันสำหรับอัพเดทจำนวนสินค้าในตะกร้า
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };
  
  // Component หน้ารายการสินค้า
  const ProductList = () => {
    return (
      <div className="product-list">
        <h1>All products</h1>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card" onClick={() => {
              setSelectedProduct(product);
              setCurrentPage('product-detail');
            }}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">{product.price} Bath</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Component หน้ารายละเอียดสินค้า
  const ProductDetail = () => {
    const [selectedSize, setSelectedSize] = useState(selectedProduct.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    
    return (
      <div className="product-detail" style={{ marginTop: '1.5rem' }}>
        <div className="actions-top">
          <button 
            className="back-button"
            onClick={() => setCurrentPage('products')}
          >
            &larr; Return to product list page
          </button>
        </div>
        
        <div className="product-detail-content">
          <div className="product-detail-image">
            <img src={selectedProduct.image} alt={selectedProduct.name} />
          </div>
          
          <div className="product-detail-info">
            <h1>{selectedProduct.name}</h1>
            <p className="product-detail-price">{selectedProduct.price} Bath</p>
            <p className="product-detail-description">{selectedProduct.description}</p>
            
            <div className="product-options">
              <div className="size-selection">
                <label>Size:</label>
                <div className="size-buttons">
                  {selectedProduct.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="quantity-selection">
                <label>Amount:</label>
                <div className="quantity-input">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              className="add-to-cart-button"
              onClick={() => addToCart(selectedProduct, selectedSize, quantity)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Component หน้าตะกร้าสินค้า
  const Cart = () => {
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [file, setFile] = useState(null);
    const [fileStatus, setFileStatus] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
    const handleProceedToOrder = () => {
      // ตรวจสอบว่าได้ดึงข้อมูลผู้ใช้มาแล้วหรือไม่

      if (!currentUser) {
        alert('Please login to proceed with the order.');
        return;
      }
      
      // แสดงรายละเอียดการสั่งซื้อด้านล่างแทนที่จะเป็น modal
      setShowOrderSummary(true);
      
      // Scroll ไปยังส่วนรายละเอียดการสั่งซื้อ
      setTimeout(() => {
        document.getElementById('order-summary-section').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    
    const handleProceedToPayment = async () => {
      // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
      if (!currentUser) {
        alert('Please login to proceed with the payment.');
        return;
      }
    
      // ดึงข้อมูลผู้ใช้จาก Firestore โดยใช้ UID ของผู้ใช้ที่ล็อกอิน
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);
    
      if (docSnap.exists()) {
        const userData = docSnap.data();
    
        // เช็คว่ามีข้อมูลครบถ้วนหรือไม่
        if (!userData.address || !userData.email || !userData.phone || !userData.name) {
          // ถ้าข้อมูลไม่ครบจะไม่ให้ไปหน้าการชำระเงิน
          alert('"Please fill in all the required information before proceeding with the payment."');
          
          // นำผู้ใช้ไปยังหน้าประวัติส่วนตัว
          navigate('/profile');  // เปลี่ยนเส้นทางไปที่ /profile
    
          return;
        }
    
        // หากข้อมูลครบถ้วนแล้ว ให้เปิด popup การชำระเงิน
        setShowPaymentPopup(true);
      } else {
          alert('"Please fill in all the required information before proceeding with the payment."');

          // นำผู้ใช้ไปยังหน้าประวัติส่วนตัว
          navigate('/profile');  // เปลี่ยนเส้นทางไปที่ /profile
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFileSelected(true);
        setFileStatus(`Selected files: ${file.name}`);
      } else {
        setFileSelected(false);
        setFileStatus('No file selected yet');
      }
    };
    
  
    const handleSubmitOrder = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
          alert('Please log in before placing an order.');
          return;
        }
    
        // Check if file is selected
        if (!fileSelected) {
          alert('Please attach the transfer slip before confirming the reservation.');
          return;
        }

        const confirmOrder = window.confirm("Confirm booking!!!");
        if (confirmOrder) {
          Swal.fire({
            title: 'Order successful',
            text: 'Order successfully!',
            icon: 'success'
          });
        }
    
        // Create order data
        const orderData = {
          userId: user.uid,
          userInfo: {
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            address: userInfo.address
          },
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            size: item.size,
            quantity: item.quantity
          })),
          totalPrice: totalPrice,
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date(),
          slipUploaded: fileStatus ? true : false
        };
    
        // Add order data to Firestore
        const orderRef = await addDoc(collection(db, "orders"), orderData);
    
        // Email template params
        const emailTemplateParams = {
          to_email: userInfo.email,  // Ensure that userInfo.email is valid
          order_id: orderRef.id,
          userName: userInfo.name,
          totalPrice: totalPrice,
          userAddress: userInfo.address,
          orders: cart.map(item => ({
            name: item.name,
            units: item.quantity,
            price: item.price
          })),
          cost: {
            shipping: "Free",
            tax: "Free"
          }
        };
    
        console.log('Email Recipient:', emailTemplateParams.to_email);  // Verify the email
    
        if (!emailTemplateParams.to_email || emailTemplateParams.to_email.trim() === "") {
          console.error('Email recipient is empty');
          return;
        }
    
        // Send email via EmailJS
        emailjs.send(
          'service_v432ydr',
          'template_l94pain',
          emailTemplateParams,
          'LsfcWD38hg2sIn3Cq'
        )
        .then((response) => {
          console.log('Email sent successfully:', response);
        })
        .catch((error) => {
          console.error('Error sending email:', error);
        });
    
        // Show confetti
        setShowConfetti(true);
    
        // Display order confirmation message
        setTimeout(() => {
          alert('The order has been sent. Your order ID is: ' + orderRef.id);
          setShowPaymentPopup(false);
          setShowConfetti(false);
          setCart([]);
          setCurrentPage('products');
        }, 2000);
    
      } catch (error) {
        console.error("Error submitting order:", error);
        alert('There was an error with your order. Please try again.');
      }
    };
    
    
  
    return (
      <div className="cart">
        <div className="cart-header">
          <h1>Cart</h1>
          <button className="back-to-shop" onClick={() => setCurrentPage('products')}>
            &larr; Continue shopping
          </button>
        </div>
  
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>There are no products in the cart.</p>
            <button className="shop-now-button" onClick={() => setCurrentPage('products')}>
              Shop for products
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Size: {item.size}</p>
                    <p className="cart-item-price">{item.price} Bath</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(index, item.quantity - 1)} className="quantity-btn">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)} className="quantity-btn">+</button>
                  </div>
                  <div className="cart-item-subtotal">
                    <p>{item.price * item.quantity} Bath</p>
                  </div>
                  <button className="remove-item" onClick={() => removeFromCart(index)}>×</button>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-total">
                <h3>Total</h3>
                <p className="total-price">{totalPrice} Bath</p>
              </div>
              <button className="checkout-button" onClick={handleProceedToOrder}>
                Proceed to order
              </button>
            </div>
          </div>
        )}
        
        {/* สรุปรายละเอียดการสั่งซื้อจะแสดงด้านล่างตะกร้าเมื่อกดปุ่ม Proceed to order */}
        {showOrderSummary && cart.length > 0 && (
          <div className="order-summary-section" id="order-summary-section">
            <div className="order-summary-container">
              <h2 className="order-summary-title">"Order Details"</h2>
              
              <div className="order-summary-content">
                <div className="customer-info-card">
                  <div className="card-header">"Customer Information"</div>
                  <div className="card-body">
                    <div className="info">
                      <h5>Name: {userInfo?.name || 'Not Found Information'}</h5>
                      <h5>Email: {userInfo?.email || 'Not Found Information'}</h5>
                      <h5>Phone: {userInfo?.phone || 'Not Found Information'}</h5>
                      <h5>Address: {userInfo?.address || 'Not Found Information'}</h5>
                    </div>
                    <p className="warning-text">!!!"Please review your information before confirming the order."</p>
                  </div>
                </div>
                
                <div className="order-items-card">
                  <div className="card-header">Order</div>
                  <div className="card-body">
                    {cart.map((item, index) => (
                      <div className="order-item-row" key={index}>
                        <div className="cart-item-mini">
                          <div className="cart-item-mini-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="cart-item-mini-details">
                            <h5>{item.name}</h5>
                            <h5>Size: {item.size}</h5>
                            <h5>Amount: {item.quantity} Piece</h5>
                            <h5>Price: {item.price} Bath/Piece</h5>
                            <h5>Total: {item.price * item.quantity} Bath</h5>
                          </div>
                        </div>
                        {index < cart.length - 1 && <hr />}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="price-summary-card">
                  <div className="card-header">Payment Balance</div>
                  <div className="card-body">
                    <div className="calc-row">
                      <span>Price</span>
                      <span>{totalPrice} Bath</span>
                    </div>
                    <div className="calc-row">
                      <span>Amount</span>
                      <span>{totalItems} Piece</span>
                    </div>
                    <div className="calc-row">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="calc-row total">
                      <span>Total</span>
                      <span>{totalPrice.toLocaleString()} Bath</span>
                    </div>
                  </div>
                </div>
                
                <div className="summary-actions">
                  <button className="proceed-payment-button" onClick={handleProceedToPayment}>
                    Proceed with Payment
                  </button>
                  <button className="cancel-button" onClick={() => setShowOrderSummary(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {showPaymentPopup && (
          <div className="modal confirmation-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="text-center" style={{ color: "white", textAlign: "center" }}>Payment</h2>
              </div>
              <div className="div">
                <h5 className="text-center">Please confirm your order.</h5>
                <p className="text-center">Please check the information before confirming the order.</p>
              </div>
              
              <div className="confirmation-details">
                <div className="price-calculation">
                  <div className="calc-row">
                    <span>Price</span>
                    <span>{totalPrice} Bath</span>
                  </div>
                  <div className="calc-row">
                    <span>Amount</span>
                    <span>{totalItems} Pieces</span>
                  </div>
                  <div className="calc-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="calc-row total">
                    <span>"Total Amount"</span>
                    <span>{totalPrice.toLocaleString()} Bath</span>
                  </div>
                </div>
                
                <div className="payment">
                  <h5 className="text-center">Please make payment.</h5>
                  <div className="payment-qrcode">
                    <img src={qr} alt="QR Code" width={200} />
                  </div>
                  <h5 className="text-center">Attach the money transfer slip:</h5>
                  <div className="input-group">
                  <label htmlFor="file-upload" className="file-upload-label">
                      <span style={{color: "white"}}>Select file</span>
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {fileStatus && (
                    <div className="file-status">{fileStatus}</div>
                  )}
                </div>
              </div>
              
              <div className="modal-buttons">
                <button className="confirm-yes" onClick={handleSubmitOrder}>
                Confirm Order
                </button>
                <button className="confirm-no" onClick={() => setShowPaymentPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    '#a1887f',
                    '#8d6e63',
                    '#795548',
                    '#6d4c41',
                    '#5d4037',
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Component ตะกร้าสินค้าแบบ mini
  const CartWidget = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
      <div className="cart-widget-container">
        <button 
          className="cart-widget-button"
          onClick={() => setCurrentPage('cart')}
        >
          <span className="cart-icon-text"><FontAwesomeIcon icon={faCartShopping} />Cart</span>
          <span className="cart-count">{totalItems}</span>
        </button>
      </div>
    );
  };
  
  return (
    <>
      <GlobalStyle />
      <div className="app">
        <main className="main-content">
          <CartWidget />
          {currentPage === 'products' && <ProductList />}
          {currentPage === 'product-detail' && selectedProduct && <ProductDetail />}
          {currentPage === 'cart' && <Cart />}
        </main>
      </div>
    </>
  );
}

export default Merchandise;