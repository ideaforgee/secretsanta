import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '../../constants/secretSantaConstants';
import { Box, Card, Typography } from '@mui/material';
import Navbar from "../../components/navbar/Navbar";
import * as Constant from '../../constants/secretSantaConstants.js';
import GameAnnouncement from '../game-announcement/GameAnnouncement.js';
import TeamSplitter from '../team-splitter/TeamSplitter.js';

function GameAssist() {
    const [resetPrompt, setResetPrompt] = useState(false);
    const [openAnnouncementPrompt, setOpenAnnouncementPrompt] = useState(false);
    const [openTeamSplitterPrompt, setOpenTeamSplitterPrompt] = useState(false);
    const navigate = useNavigate();

    const onGameAnnouncementClick = () => {
        setResetPrompt(true);
        setOpenAnnouncementPrompt(true);
    };

    const handleCloseGameAnnouncementPrompt = () => {
        setResetPrompt(false);
        setOpenAnnouncementPrompt(false);
    };

    const onTeamSplitterClick = () => {
        setResetPrompt(true);
        setOpenTeamSplitterPrompt(true);
    }

    const handleCloseTeamSplitterPrompt = () => {
        setResetPrompt(false);
        setOpenTeamSplitterPrompt(false);
    }

    const onBuzzerTimerClick = () => {
        navigate(ROUTE_PATH.BUZZER_TIMER);
    }

    const onTeamDiscussionClick = () => {
        navigate(ROUTE_PATH.GROUP_DISCUSSION);
    }

    const cards = [
        { text: 'Announcement', onClick: onGameAnnouncementClick },
        { text: 'Team Splitter', onClick: onTeamSplitterClick },
        { text: 'Buzzer Timer', onClick: onBuzzerTimerClick },
        { text: 'Team Discussion', onClick: onTeamDiscussionClick },
    ];
  return (
    <div style={Constant.FUN_ZONE_STYLE}className='game-zone-container'>
        <div><Navbar title={'Game Assist'}/></div>
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
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #ddd',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                        onClick={card.onClick}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#333',
                            }}
                        >
                            {card.text}
                        </Typography>
                    </Card>
                ))}
            </Box>
          {openAnnouncementPrompt && <GameAnnouncement open={openAnnouncementPrompt} onClose={handleCloseGameAnnouncementPrompt} resetPrompt={resetPrompt} />}
          {openTeamSplitterPrompt && <TeamSplitter open={openTeamSplitterPrompt} onClose={handleCloseTeamSplitterPrompt} resetPrompt={resetPrompt} />}
        </div>
  )
}

export default GameAssist