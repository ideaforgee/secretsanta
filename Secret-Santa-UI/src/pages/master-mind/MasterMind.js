import React, { useEffect, useState } from 'react';
import './MasterMind.css';
import { USER_KEY, MASTER_MIND_GAME_KEY, MASTER_MIND_GAME_SEVERITY_KEY } from '../../constants/appConstant';
import { getUserMasterGameInfo, validateUserMasterMindLevel, setIsCompleteTrue } from '../../services/gameService';
import { useNavigate } from 'react-router-dom';
import CongratsPopup from '../../components/Congrats/CongratsMasterMindGame';
import QuitPopup from '../../components/Quit/QuitMasterMindGame';
import ReturnFunZonePopUp from '../../components/ReturnFunZonePopUp/ReturnFunZonePopUp';
import Navbar from '../../components/navbar/Navbar';
import * as Constant from '../../constants/secretSantaConstants';
import { useAlert } from '../../context/AlertContext.js';


const MasterMind = () => {

  const userId = localStorage.getItem(USER_KEY);
  const masterMindGameId = localStorage.getItem(MASTER_MIND_GAME_KEY);
  const masterMindGameSeverityLevel = localStorage.getItem(MASTER_MIND_GAME_SEVERITY_KEY);

  const [selectedColor, setSelectedColor] = useState(null);
  const [levels, setLevels] = useState(Array(8).fill().map(() => Array(4).fill(null)));
  const [hints, setHints] = useState(Array(8).fill().map(() => []));
  const [currentLevel, setCurrentLevel] = useState(0);
  const [verifiedLevels, setVerifiedLevels] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [isCongratsPopUpDisplay, setCongratsPopUpDisplay] = useState(false);
  const [isQuitPopUpDisplay, setQuitPopUpDisplay] = useState(false);
  const [isReturnFunZonePopUpDisplay, setReturnFunZonePopUpDisplay] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [totalGusses, setTotalGusses] = useState(0);
  const [colors, setAllColors] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const reverseColorMap = Object.fromEntries(Object.entries(colorMap).map(([num, color]) => [color, Number(num)]));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserMasterGameInfo(userId, masterMindGameId);
        setTotalLevels(response.totalLevels);
        setColorMap(response.allColors);
        setTotalGusses(response.totalGusses);
        setCurrentLevel(response.currentLevel ?? 0);
        setVerifiedLevels(response.verifiedLevels ?? []);
        setGameComplete(response.gameComplete ?? false);

        setAllColors(response.allColors = Object.values(response.allColors));

        setLevels(
          response.levels.length
            ? response.levels
            : Array(response.totalLevels).fill().map(() => Array(response.totalGusses).fill(null))
        );
        setHints(
          response.hints.length
            ? response.hints
            : Array(response.totalLevels).fill().map(() => [])
        );

        if (response.gameComplete) {
          const hasFourRedHints = response.hints?.some(hintArray =>
            hintArray.filter(hint => hint === "red").length === response.totalGusses
          );

          if (hasFourRedHints) {
            setCongratsPopUpDisplay(true);
          } else {
            setQuitPopUpDisplay(true);
          }
        }

        if (response.currentLevel === response.totalLevels + 1) {
          await setIsCompleteTrue(userId, masterMindGameId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


  const handleQuit = async () => {
    await setIsCompleteTrue(userId, masterMindGameId);
    setGameComplete(true);
    setQuitPopUpDisplay(true);
  };

  const handleHomeButton = () => {
    setReturnFunZonePopUpDisplay(true);
  }

  const onConfirmReturnFunZone = () => {
    showAlert(Constant.ALERT_MESSAGES.RETURNED_TO_FUN_ZONE, Constant.SUCCESS);
    localStorage.removeItem(MASTER_MIND_GAME_KEY);
    localStorage.removeItem(MASTER_MIND_GAME_SEVERITY_KEY);
    navigate('/game-zone');
  }

  const handleDragStart = (color, levelIndex = null, slotIndex = null) => {
    if (!gameComplete && !verifiedLevels?.includes(levelIndex)) {
      setSelectedColor({ color, levelIndex, slotIndex });
    }
  };

  const handleDrop = (levelIndex, slotIndex) => {
    if (!gameComplete && levelIndex === currentLevel && !verifiedLevels?.includes(levelIndex)) {
      const newLevels = [...levels];
      if (selectedColor) {
        if (selectedColor.levelIndex !== null && selectedColor.slotIndex !== null) {
          newLevels[selectedColor.levelIndex][selectedColor.slotIndex] = null;
        }
        const clr = Number(selectedColor.color) > 0 ? selectedColor.color : reverseColorMap[selectedColor.color];
        newLevels[levelIndex][slotIndex] = clr;
        setLevels(newLevels);
        setSelectedColor(null);
      }
    }
  };

  const handleRemoveDrop = () => {
    if (
      selectedColor &&
      selectedColor.levelIndex !== null &&
      selectedColor.slotIndex !== null &&
      !verifiedLevels?.includes(selectedColor.levelIndex)
    ) {
      const newLevels = [...levels];
      newLevels[selectedColor.levelIndex][selectedColor.slotIndex] = null;
      setLevels(newLevels);
      setSelectedColor(null);
    }
  };

  const handleVerify = async () => {
    if (!gameComplete && levels[currentLevel].every((slot) => slot !== null)) {
      const result = await validateUserMasterMindLevel(userId, masterMindGameId, currentLevel, levels[currentLevel]);
      const resutlArray = result.split(",").map(String);
      const isAllRed = resutlArray?.every(code => code === 'red') && resutlArray?.length === totalGusses;
      if (isAllRed) {
        setCongratsPopUpDisplay(true);
        setGameComplete(true);
      }
      if (currentLevel === totalLevels - 1 && !isAllRed) {
        setQuitPopUpDisplay(true);
        setGameComplete(true);
      }
      setHints((prevHints) => {
        const newHints = [...prevHints];
        newHints[currentLevel] = result?.split(",") || [];
        return newHints;
      });
      setVerifiedLevels([...verifiedLevels, currentLevel]);
      setCurrentLevel((prev) => Math.min(prev + 1, totalLevels - 1));
    }
  };

  return (
    <div className={`game-container ${gameComplete ? "game-over" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={handleRemoveDrop}>
      <div><Navbar title={'MASTER MIND'} /></div>
      <h1>🎯 Master Mind Game</h1>
      <p className="instructions">Drag & Drop colors, then verify!</p>

      <div className="game-board">
        {levels.map((level, levelIndex) => (
          <div key={levelIndex} className={`level ${levelIndex === currentLevel ? "active" : "disabled"}`}>
            <span className="level-label">LEVEL - {levelIndex + 1}</span>
            {level.map((colorCode, slotIndex) => (
              <div
                key={slotIndex}
                className="color-slot"
                style={{ backgroundColor: colorMap[colorCode] || "grey" }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(levelIndex, slotIndex)}
                onDragStart={() => handleDragStart(colorCode, levelIndex, slotIndex)}
                draggable={!gameComplete && colorCode !== null && !verifiedLevels?.includes(levelIndex)}
              ></div>
            ))}
            <div className="hint-box">
              {hints[levelIndex].map((hint, index) => (
                <div key={index} className={`hint-circle ${hint}`}></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="color-palette">
        {colors.map((color) => (
          <div
            key={color}
            className="color-btn"
            style={{ background: color }}
            draggable={!gameComplete}
            onDragStart={() => handleDragStart(color)}
          ></div>
        ))}
      </div>

      <div>
        {isCongratsPopUpDisplay && (
          <CongratsPopup
            colorMap={colorMap}
            onClose={() => {
              setCongratsPopUpDisplay(false);
            }}
          />
        )}

        {isQuitPopUpDisplay && (
          <QuitPopup
            colorMap={colorMap}
            onClose={() => {
              setQuitPopUpDisplay(false);
            }}
          />
        )}

      </div>
      <div class="buttons">
        <button className={`quit-btn ${(gameComplete || currentLevel === 0) ? "disabled" : ""}`} onClick={handleQuit} disabled={gameComplete || currentLevel === 0}>🚪 Quit</button>
        <button className={`verify-btn ${levels[currentLevel]?.includes(null) ? "disabled" : ""}`} onClick={handleVerify} disabled={gameComplete || levels[currentLevel]?.includes(null)}>✅ Verify</button>
        <button className="home-btn" onClick={handleHomeButton}>🏠 Return to FunZone</button>
      </div>

      {isReturnFunZonePopUpDisplay && (
        <ReturnFunZonePopUp
          onConfirmReturnFunZone={() => {
            onConfirmReturnFunZone();
            setReturnFunZonePopUpDisplay(false);
          }}
          onCloseReturnFunZone={() => {
            setReturnFunZonePopUpDisplay(false);
          }}
        />
      )}
    </div>
  );
};

export default MasterMind;
