import React, { useEffect } from 'react';
import './BuzzerResultComponent.css';

const BuzzerResultComponent = ({ userList }) => {
  useEffect(() => {
    const listContainer = document.getElementById('user-list-container');
    listContainer.scrollTop = listContainer.scrollHeight;
  }, [userList]);


  const sortedUsers = [...userList].sort((a, b) => a.time - b.time);

  return (
    <div id="user-list-container" className="user-list-container">
      <h2>Users Who Pressed the Buzzer:</h2>
      <ul className="user-list">
        {sortedUsers.map((user, index) => (
          <li key={index} className="user-item">
            <div className="user-card">
              <span className="user-name">{`${user.name} pressed the buzzer`}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuzzerResultComponent;
