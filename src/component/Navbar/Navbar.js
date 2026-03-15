import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook
import './Navbar.css'; // Make sure to create the CSS file for styling

const Navbar = () => {
  const { isAuthenticated, logout, userRole } = useAuth(); // Destructure isAuthenticated, logout and userRole from useAuth
  const navigate = useNavigate(); // Get the navigate function
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // Call the logout function from the context
    navigate('/'); // Redirect to the login page
    closeMenu();
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      if (userRole === "admin1" || userRole === "user") {
        navigate("/homepage");
      }
    } else {
      navigate("/");
    }
    closeMenu();
  };

  return (
    <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
      <div className="navbar-container">
        <div className="logo-placeholder"></div> {/* Empty or Logo */}

        <div className="hamburger" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>

        <ul className={isMenuOpen ? 'active' : ''}>
          {/* Dedicated header for mobile with close button on the left */}
          <div className="mobile-nav-header">
            <button className="close-menu-btn" onClick={closeMenu}>&times;</button>
          </div>

          <li>
            <button
              type="button"
              onClick={handleButtonClick}
              className="nav-action-button"
            >
              {isAuthenticated ? "Homepage" : "Login"}
            </button>
          </li>
          {/* <li><NavLink to="/aboutpet" onClick={closeMenu} activeClassName="active">About PET</NavLink></li> */}
          <li><NavLink to="/homepage" onClick={closeMenu} activeClassName="active">Genealogy</NavLink></li>
          {/* <li><NavLink to="/history" onClick={closeMenu} activeClassName="active">History</NavLink></li> */}
          {/* <li><NavLink to="/gallery" onClick={closeMenu} activeClassName="active">Gallery</NavLink></li> */}
          {/* <li><NavLink to="/MemberList" onClick={closeMenu} activeClassName="active">Member List</NavLink></li> */}
          {isAuthenticated && (
            <li>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
