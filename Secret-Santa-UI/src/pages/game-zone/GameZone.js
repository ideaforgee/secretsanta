import React, { useState } from 'react'
import { Box, Card, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "./GameZone.css"
import { MASTER_MIND_GAME_KEY, MASTER_MIND_GAME_SEVERITY_KEY, TAMBOLA_GAME_KEY, USER_KEY } from '../../constants/appConstant'
import { createNewMasterMindGame, createNewTambolaGame, joinUserToTambolaGame } from '../../services/gameService'
import LevelPopUp from '../../components/LevelPopUp/LevelPopUp'
import * as Constant from '../../constants/secretSantaConstants.js';
import secretSantaImg from '../../assets/christmasbg.jpg';
import masterMindImg from '../../assets/MasterMindBg.jpg';
import tambolaImg from '../../assets/housieBg.jpg';
import CodeDialog from '../../components/CodeDialog/CodeDialog.js';
import TambolaDashboardPopup from '../../components/TambolaDashboard/TambolaDashboard.js';
import { useAlert } from '../../context/AlertContext.js';
import TambolaTicket from '../../components/TambolaTicket/TambolaTicket.js';

function GameZone() {

    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [resetForm, setResetForm] = useState(false);
    const [openJoinGame, setOpenJoinGame] = useState(false);
    const [buttonText, setButtonText] = useState(Constant.EMPTY);
    const [dialogTitle, setDialogTitle] = useState(Constant.EMPTY);
    const [onSubmitHandler, setOnSubmitHandler] = useState(() => { });
    const userId = localStorage.getItem(USER_KEY);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isTambolaDashboardVisible, setIsTambolaDashboardVisible] = useState(false);

    const onClickSecretSantaGame = () => {
        navigate(Constant.ROUTE_PATH.DASHBOARD);
    }

    const handleLevelSelect = async (severity) => {
        const masterMindGameId = await createNewMasterMindGame(userId, severity);
        localStorage.setItem(MASTER_MIND_GAME_KEY, masterMindGameId);
        localStorage.setItem(MASTER_MIND_GAME_SEVERITY_KEY, severity);
        setPopupVisible(false);
        navigate(Constant.ROUTE_PATH.MASTER_MIND);
    };

    const onClickMasterMindGame = () => {
        if (!localStorage.getItem(MASTER_MIND_GAME_KEY)) {
            setPopupVisible(true);
        } else {
            navigate(Constant.ROUTE_PATH.MASTER_MIND);
        }
    }

    const onClickHousieGame = () => {
        if (!localStorage.getItem(TAMBOLA_GAME_KEY)) {
            setIsTambolaDashboardVisible(true);
        } else {
            navigate(Constant.ROUTE_PATH.TAMBOLA);
        }
    }

    const onClickTambolaHostGame = async () => {
        const response = await createNewTambolaGame(userId);
        setIsTambolaDashboardVisible(false);
        showAlert(response.message, Constant.SUCCESS);
    }

    const onClickTambolaJoinGame = async (tambolaGameCode) => {
        if (localStorage.getItem(TAMBOLA_GAME_KEY)) {
            navigate(Constant.ROUTE_PATH.TAMBOLA);
        } else {
            setResetForm(true);
            setOnSubmitHandler(() => handleJoinGameSubmit);
            setButtonText(Constant.JOIN);
            setDialogTitle(Constant.JOIN_GAME);
            setOpenJoinGame(true);
        }
    }

    const handleJoinGameSubmit = async (gameCode) => {
        try {
          const response = await joinUserToTambolaGame(userId, gameCode);
          if (response) {
            return { gameId: response,key: TAMBOLA_GAME_KEY , path: Constant.ROUTE_PATH.TAMBOLA };
          }
        } catch (error) {
          throw error;
        }
      };

    const handleCloseJoinGame = async () => {
        setResetForm(false);
        setOpenJoinGame(false);
    }

    const cards = [
        { text: 'Secret Santa', onClick: onClickSecretSantaGame, bgImage: secretSantaImg },
        { text: 'Master Mind', onClick: onClickMasterMindGame, bgImage: masterMindImg },
        { text: 'Housie', onClick: onClickHousieGame, bgImage: tambolaImg },
    ];

    return (
        <div style={Constant.FUN_ZONE_STYLE} className='game-zone-container'>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                }}
            >
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        variant="outlined"
                        sx={{
                            width: 250,
                            height: 250,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            backgroundColor: 'rgb(245, 245, 245)',
                            backgroundImage: `url(${card.bgImage})`,
                            backdropFilter: 'blur(10000px)',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #ddd',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                            },
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${card.bgImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(3px)',
                                zIndex: -1,
                            },
                        }}
                        onClick={card.onClick}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#ffffff',
                            }}
                        >
                            {card.text}
                        </Typography>
                    </Card>
                ))}

                {isPopupVisible && (
                    <LevelPopUp
                        onClose={() => setPopupVisible(false)}
                        onLevelSelect={handleLevelSelect}
                    />
                )}
                {isTambolaDashboardVisible && (
                    <TambolaDashboardPopup
                        visible={isTambolaDashboardVisible}
                        onClose={() => setIsTambolaDashboardVisible(false)}
                        onJoinGame={onClickTambolaJoinGame}
                        onHostGame={onClickTambolaHostGame}
                    />
                )}

                <CodeDialog
                    open={openJoinGame}
                    onClose={handleCloseJoinGame}
                    buttonText={buttonText}
                    dialogTitle={dialogTitle}
                    onSubmit={onSubmitHandler}
                    resetForm={resetForm}
                ></CodeDialog>
            </Box>
        </div>
    )
}

export default GameZone