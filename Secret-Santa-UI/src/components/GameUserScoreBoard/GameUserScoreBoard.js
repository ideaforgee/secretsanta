import React, { useEffect, useState } from "react";
import { TAMBOLA_GAME_KEY } from '../../constants/appConstant';
import { ImCross } from "react-icons/im";
import { gatGameUsersWithScore } from "../../services/gameService";
import "./GameUserScoreBoard.css";

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
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="close-icon" onClick={onClose}><ImCross /></div>
        <h2>Tambola ScoreBoard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {users.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.currentScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameUsersScoreboard;
