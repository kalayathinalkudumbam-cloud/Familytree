import React from "react";
import "./about.css";
import Navbar from '../../component/Navbar/Navbar'; // Import Navbar component

const AboutPage = () => {
  return (
    
    <div className="main-content">
    
      <Navbar /> {/* Use Navbar component */}
      
      <div className="content-section">
        
        <h1>HOME PAGE (Main Tree)</h1>
        <p>
          It has all 11 branches in a clock-like structure, with P J Joseph (Echachen) and Amma at the top, and all the children / 11 branches organized around them in a circular arrangement based on their seniority.
          To know the details of each branch, click on each branch and all sub-branches can be seen. Details of individuals can be obtained by clicking on each photo. All male members are in blue and female in pink color.
          Searching of individuals by Name or Nickname or Family ID is possible on the top right corner.
        </p>
      </div>

      <div className="content-section">
      
        <h2>MEMBER LIST</h2>
        <p>
          Details of all the members in the group can be obtained here. Searching by Name or Nickname or Family ID is possible on top. Also, at the end of each member line, a ‘TREE’ button is provided, which will take you directly to the tree where that member belongs to.
        </p>
      </div>

      <div className="content-section">
        <h2>WHAT IS FAMILY ID?</h2>
        <p>
          It is a unique ID given to each cousin of all generations.
        </p>
        <table className="generation-table">
          <thead>
            <tr>
              <th>Generation</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
              <th>6</th>
              <th>7</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Family ID</td>
              <td className="bold-cell">P</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
   
        <p>
          Each letter identifies the cousins' generation, chronological order (alphabetical order as per seniority), and gender (male or female).
          First letter is ‘P’ and common to all, the first generation, i.e., P J Joseph (Echachen) and Maryamma Joseph (Amma).
          Second letter is for the second generation children in alphabetical order as per seniority and capital letter (Upper Case) for males and small letter (Lower case) for females.
        </p>
        <table>
          <thead>
            <tr>
              <th>Generation</th>
              <th>Details</th>
              <th>Family ID</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>PENNAMMA / CHECHY</td><td>Pa</td></tr>
            <tr><td>2</td><td>P J JOSEPH / KUNJETTAN</td><td>PB</td></tr>
            <tr><td>3</td><td>ANNAKUTTY JOSEPH / KUNCHECHI</td><td>Pc</td></tr>
            <tr><td>4</td><td>P J MATHEW / KUNJANJA</td><td>PD</td></tr>
            <tr><td>5</td><td>Sr. MARIA THERESE / KUNJAMMA</td><td>Pe</td></tr>
            <tr><td>6</td><td>P J THOMAS / ACHA</td><td>PF</td></tr>
            <tr><td>7</td><td>Fr. P J SEBASTIAN / ACHEN KUNJUPAPAEN</td><td>PG</td></tr>
            <tr><td>8</td><td>P J THRESIAMMA / THEYYAMMA</td><td>Ph</td></tr>
            <tr><td>9</td><td>P J ROSAMMA / KUNJUROMA</td><td>Pi</td></tr>
            <tr><td>10</td><td>ACHAMMA JOSE / ACHAMAKUTTY</td><td>Pj</td></tr>
            <tr><td>11</td><td>P J GEORGE / VARKYCHEN</td><td>PK</td></tr>
          </tbody>
        </table>
        <p>
          Similarly, the 3rd, 4th, and 5th letters correspond to the third, fourth, and fifth generations of cousins in alphabetical order as per seniority and male or female in upper or lower case respectively.
        </p>
      </div>

      <div className="content-section">
      
        <h2>EXAMPLE NO 1</h2>
        <p>
          PBABB (KARYACHEN)
        </p>
        <p>
          ‘P’ - First generation P J Joseph (Echachen)<br />
          ‘B’ - Second generation second child (son) P J Joseph (Kunjettan)<br />
          ‘A’ - Third generation first child (son) Kuttichen<br />
          ‘B’ - Fourth generation second child (son) Bobby<br />
          ‘B’ - Fifth generation second child (son) Karyachen
        </p>

        <h2>EXAMPLE NO 2</h2>
        <p>
          Phaba (KAATHY)
        </p>
        <p>
          ‘P’ - First generation P J Joseph (Echachen)<br />
          ‘h’ - Second generation 8th child (daughter) Theyyamma<br />
          ‘a’ - Third generation first child (daughter) Sherly<br />
          ‘b’ - Fourth generation second child (daughter) Neenu<br />
          ‘a’ - Fifth generation first child (daughter) Kaathy
        </p>
        </div>
        <div className="content-section">
      <div className="background-block">
        <h2>hjadhjad</h2>
        </div>
        </div>
    </div>
    
  );
};

export default AboutPage;
