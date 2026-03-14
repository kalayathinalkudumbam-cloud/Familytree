import React, { useState, useEffect } from "react";
import "../MemberList/memberlist.css"; // Assuming you will create or update the CSS file accordingly

import Navbar from '../../component/Navbar/Navbar'; // Import Navbar component
import { useNavigate } from "react-router-dom";

const MemberList = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchFamilyMembers = async () => {
    try {
      const CLOUDFLARE_WORKER_URL = process.env.REACT_APP_CLOUDFLARE_WORKER_URL;
      const response = await fetch(CLOUDFLARE_WORKER_URL);
      const data = await response.json();

      if (data.message === "No data yet") {
        setFamilyMembers([]);
      } else {
        // The Cloudflare Worker returns the data in a slightly different format 
        // than the old backend, but based on FamilyTree.js, it's an array.
        setFamilyMembers(data);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // Filter members by name, nickname, or familyId
  const filteredMembers = familyMembers.filter((member) => {
    const name = member.data ? `${member.data['first name'] || ''} ${member.data['last name'] || ''}` : (member.name || "");
    const nickName = member.data ? (member.data['nick_name'] || "") : (member.nickName || "");
    const familyId = member.data ? (member.data['familyId'] || "") : (member.familyId || "");

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nickName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familyId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sorting filteredMembers by name in alphabetical order
  filteredMembers.sort((a, b) => {
    const nameA = a.data ? `${a.data['first name'] || ''} ${a.data['last name'] || ''}` : (a.name || "");
    const nameB = b.data ? `${b.data['first name'] || ''} ${b.data['last name'] || ''}` : (b.name || "");
    return nameA.localeCompare(nameB);
  });

  return (

    <div className="member-list">
      <div className='navContent'>
        <Navbar /> {/* Use Navbar component */}
      </div>
      <h1>Family Member List</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Name, Nickname, or Family ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Nickname</th>
                <th>Family ID</th>
                <th>Birth Date</th>
                <th>Death Date</th>
                <th>Address</th>
                <th>Mobile Number</th>
                <th>Whatsapp Number</th>
                <th>Image</th>
                <th>Tree</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.data ? `${member.data['first name'] || ''} ${member.data['last name'] || ''}` : member.name}</td>
                  <td>{member.data ? member.data['nick_name'] : member.nickName}</td>
                  <td>{member.data ? member.data['familyId'] : member.familyId}</td>
                  <td>{member.data ? member.data['birthday'] : member.birthDate}</td>
                  <td>{member.data ? member.data['death_date'] : member.deathDate}</td>
                  <td>{member.data ? member.data['address'] : member.address}</td>
                  <td>{member.data ? member.data['mobile_no'] : member.mobileNo}</td>
                  <td>{member.data ? member.data['whatsapp_number'] : member.whatsappNumber}</td>
                  <td>
                    {(member.data?.avatar || member.img) && (
                      <img src={member.data?.avatar || member.img} alt="Member" width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    )}
                  </td>
                  <td>
                    <button onClick={() => {
                      const name = member.data ? `${member.data['first name'] || ''} ${member.data['last name'] || ''}`.trim() : member.name;
                      // Pass both internal ID and name for fallback/visual search
                      navigate(`/familytree?personId=${member.id}&name=${encodeURIComponent(name)}`);
                    }}>
                      Tree
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
