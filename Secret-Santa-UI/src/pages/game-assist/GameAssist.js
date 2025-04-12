import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '../../constants/secretSantaConstants';
import { Box, Card, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
import Navbar from "../../components/navbar/Navbar";
import * as Constant from '../../constants/secretSantaConstants.js';
import GameAnnouncement from '../game-announcement/GameAnnouncement.js';
import TeamSplitter from '../team-splitter/TeamSplitter.js';
import announcement from '../../assets/announcement.jpeg';
import splitter from '../../assets/splitter.jpeg';
import buzzer from '../../assets/buzzer.jpeg';
import discussion from '../../assets/discussion.jpeg';

function GameAssist() {
    const [resetPrompt, setResetPrompt] = useState(false);
    const [openAnnouncementPrompt, setOpenAnnouncementPrompt] = useState(false);
    const [openTeamSplitterPrompt, setOpenTeamSplitterPrompt] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    };

    const handleCloseTeamSplitterPrompt = () => {
        setResetPrompt(false);
        setOpenTeamSplitterPrompt(false);
    };

    const onBuzzerTimerClick = () => {
        navigate(ROUTE_PATH.BUZZER_TIMER);
    };

    const onTeamDiscussionClick = () => {
        navigate(ROUTE_PATH.GROUP_DISCUSSION);
    };

    const cards = [
        { text: 'Game Announcement', onClick: onGameAnnouncementClick, bgImage: announcement },
        { text: 'Team Splitter', onClick: onTeamSplitterClick, bgImage: splitter },
        { text: 'Buzzer Timer', onClick: onBuzzerTimerClick, bgImage: buzzer },
        { text: 'Team Discussion', onClick: onTeamDiscussionClick, bgImage: discussion }
    ];

    return (
        <div style={{
            ...Constant.FUN_ZONE_STYLE,
            overflowY: 'auto',
            maxHeight: '100vh'
        }} className="game-zone-container">
            <Navbar title={'Game Assist'} />
            <Box
                sx={{
                    mt: 7,
                    pt: isSmallScreen ? 10 : 0,
                    width: '80%',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto'
                }}
            >
                <Grid container spacing={3} justifyContent="center">
                    {cards.map((card, index) => (
                        <Grid
                            key={index}
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Card
                                onClick={card.onClick}
                                sx={{
                                    width: isSmallScreen ? '90%' : '100%',
                                    height: isSmallScreen ? 180 : 250,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '16px',
                                    backgroundImage: `url(${card.bgImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                                        cursor: 'pointer',
                                    },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: '#ffffff',
                                        textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
                                        px: 1,
                                    }}
                                >
                                    {card.text}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Modals */}
            {openAnnouncementPrompt && (
                <GameAnnouncement
                    open={openAnnouncementPrompt}
                    onClose={handleCloseGameAnnouncementPrompt}
                    resetPrompt={resetPrompt}
                />
            )}
            {openTeamSplitterPrompt && (
                <TeamSplitter
                    open={openTeamSplitterPrompt}
                    onClose={handleCloseTeamSplitterPrompt}
                    resetPrompt={resetPrompt}
                />
            )}
        </div>
    );
}

export default GameAssist;
