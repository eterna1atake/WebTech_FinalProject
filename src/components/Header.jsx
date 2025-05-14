import "../styles/Header.css";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUser, FaConciergeBell, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";


export default function Header(props) {
    const { user, signIn, signOut } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {user ? (
                <header className="header">
                {/* Nav Brand */}
                <div className="nav-brand">
                  <span onClick={()=>navigate('/')}>Party Comedu</span>
                </div>
              
                {/* Middle Navigation */}
                <div className="middle-nav">
                  <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/TableReservation">Reservation</Link></li>
                    <li><Link to="/merchandise">Merchandise</Link></li>
                  </ul>
                </div>
              
                {/* Right Section */}
                <div className="right-section">
                  <span>Hello, {user.displayName}</span>
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="profile-img"
                  />
                  {/* Toggle Menu */}
                  <button className="menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                  </button>
                </div>
              
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="menu-list">
                    <ul>
                      <li>
                        <Link to="/profile" className="menu-link">
                          <FaUser className="icon" />
                          <div className="info-list">
                            <h4>My Profile</h4>
                            <p>Your profile</p>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link to="/reserve-table" className="menu-link">
                          <FaConciergeBell className="icon" />
                          <div className="info-list">
                            <h4>Booking your table</h4>
                            <p>Book a table in advance</p>
                          </div>
                        </Link>
                      </li>
                    </ul>
                    <div className="menu-footer">
                      <button className="btn" onClick={signOut}>Logout</button>
                    </div>
                  </div>
                )}
              </header>
            ) : (
                <header className="header">
                    <div className="nav-brand">
                        <span>Party Comedu</span>
                    </div>
                    <div className="right-section">
                        <button className="btn" onClick={signIn}>Login</button>
                    </div>
                </header>
            )}
        </>
    );
}
