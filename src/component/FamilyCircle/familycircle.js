/*import React from 'react';
import { Link } from 'react-router-dom';
import '../FamilyCircle/FamilyCircle.css'; // Ensure the CSS file exists

const children = [
  { name: 'Child 3', image: require('./images/3.jpg'), id: 3 },
  { name: 'Child 4', image: require('./images/4.jpg'), id: 4 },
  { name: 'Child 5', image: require('./images/5.jpg'), id: 5 },
  { name: 'Child 6', image: require('./images/6.jpg'), id: 6 },
  { name: 'Child 7', image: require('./images/7.jpg'), id: 7 },
  { name: 'Child 8', image: require('./images/8.jpg'), id: 8 },
  { name: 'Child 9', image: require('./images/9.jpeg'), id: 9 },
  { name: 'Child 10', image: require('./images/10.jpg'), id: 10 },
  { name: 'Child 11', image: require('./images/11.jpg'), id: 11 },
  { name: 'PJ Joseph', image: require('./images/12.jpg'), id: 0 },
  { name: 'Child 1', image: require('./images/child1.jpg'), id: 1 },
  { name: 'Child 2', image: require('./images/2.jpg'), id: 2 },
];

const FamilyCircle = () => {
  return (
    <div className="circle-container">
      {children.map((child, index) => (
        child.id !== 3 && child.id !== 5 && child.id !== 7 && child.id !== 0  ? (
          <Link key={index} to={`/familytree?id=${child.id}`} className={`circle-card card-${index}`}>
            <img src={child.image} alt={child.name} />
          </Link>
        ) : (
          <div key={index} className={`circle-card card-${index}`}>
            <img src={child.image} alt={child.name} />
          </div>
        )
      ))}
    </div>
  );
};

export default FamilyCircle;
*/

import React from 'react';
import { Link } from 'react-router-dom';
import '../FamilyCircle/FamilyCircle.css'; // Ensure the CSS file exists

/*const children = [
  { name: 'PJ Joseph', image: require('./images/12.jpg'), id: 0 },
  { name: 'Child 1', image: require('./images/child1.jpg'), id: 1, originalID: "1" },
  { name: 'Child 2', image: require('./images/2.jpg'), id: 2, originalID: "2" },
  { name: 'Child 2', image: require('./images/2.jpg'), id: 2, originalID: "3" },
  { name: 'Child 2', image: require('./images/2.jpg'), id: 2, originalID: "4" },
  { name: 'Child 2', image: require('./images/2.jpg'), id: 2, originalID: "5" }
];*/

const children = [
  { name: 'Mathu & Mariyam', label: 'C0', id: 0 },
  { name: 'Mathai', label: 'C1', id: 1, originalID: "1" },
  { name: 'Mathu Mathu', label: 'C2', id: 2, originalID: "2" },
  { name: 'Devasia', label: 'C3', id: 3, originalID: "3" },
  { name: 'Abraham Kathanar', label: 'C4', id: 4, originalID: "4" },
  { name: 'Aley', label: 'C5', id: 5, originalID: "5" }
];

const FamilyCircle = () => {
  return (
    <div className="circle-container">
      <p className="text-color">Click on any Image</p>
      {children.map((child, index) => (
        <Link
          key={index}
          to={child.id === 0 ? '/familytree' : `/familytree?personId=${child.originalID}`}
          className={`circle-card card-${index}`}
        >
          <img src={child.image} alt={child.name} />
        </Link>
      ))}
    </div>
  );
};

export default FamilyCircle;
