import React from "react";
import NewFamilyTree from "../../component/NewFamilyTree/FamilyTree";

import "./landingpage.css";
import Navbar from "../../component/Navbar/Navbar";

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div style={{ flex: 1 }}>
        <NewFamilyTree />
      </div>
      <div className="Navbar">
        <Navbar /> {/* Use Navbar component */}
      </div>
    </div>
  );  
};

export default LandingPage;
