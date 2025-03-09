import React, { useEffect, useState } from "react";
import { TAMBOLA_GAME_KEY } from '../../constants/appConstant';
import { gatGameUsersWithScore } from "../../services/gameService";

const GameUsersScoreboard = ({ onClose }) => {
  const tambolaGameId = localStorage.getItem(TAMBOLA_GAME_KEY);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPattern = async () => {
      try {
        const response = await gatGameUsersWithScore(tambolaGameId);
        setUsers(response);
      } catch (error) {
        console.error("Error fetching game users:", error);
      }
    };

    fetchPattern();
  }, []);
  return (
    <div className="scoreboard-container p-4 bg-gray-800 text-white rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Game Leader Board</h2>
      <ul className="divide-y divide-gray-600">
        {users.map((user, index) => (
          <li
            key={user.id}
            className="flex justify-between py-2 px-4 hover:bg-gray-700 rounded-lg"
          >
            <span className="font-medium">{user.name}</span>
            <span className="font-bold text-green-400">{user.currentScore}</span>
          </li>
        ))}
      </ul>
      <button className="close-btn" onClick={onClose}>Close</button>
    </div>
  );
};

export default GameUsersScoreboard;
