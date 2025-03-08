import React, { useState } from 'react'
import { Box, Card, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "./GameZone.css"
import { MASTER_MIND_GAME_KEY, MASTER_MIND_GAME_SEVERITY_KEY } from '../../constants/appConstant'
import { createNewMasterMindGame } from '../../services/gameService'
import LevelPopUp from '../../components/LevelPopUp/LevelPopUp'
import * as Constant from '../../constants/secretSantaConstants.js';
import secretSantaImg from '../../assets/christmasbg.jpg';
import masterMindImg from '../../assets/MasterMindBg.jpg';
import tambolaImg from '../../assets/housieBg.jpg';

function GameZone() {

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [isPopupVisible, setPopupVisible] = useState(false);

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
        // if (!localStorage.getItem(TAMBOLA_GAME_KEY)) {
        //     setPopupVisible(true);
        // } else {
            navigate(Constant.ROUTE_PATH.TAMBOLA);
        // }
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
            </Box>
        </div>
    )
}

export default GameZone