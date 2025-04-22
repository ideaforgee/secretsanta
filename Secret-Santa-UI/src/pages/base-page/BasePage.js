import React, { useState } from 'react';
import './BasePage.css';
import CreateGroup from '../create-group/CreateGroup';
import * as Constant from '../../constants/secretSantaConstants.js';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Grid, useMediaQuery, useTheme, IconButton } from '@mui/material';
import Navbar from "../../components/navbar/Navbar";
import CodeDialog from '../../components/CodeDialog/CodeDialog';
import { GROUP_ID_KEY, USER_KEY } from '../../constants/appConstant.js';
import { gameAssistHandler } from '../../services/groupService.js';
import funZoneGroup from '../../assets/funZoneGroup.jpeg';
import gameZone from '../../assets/gameZone.jpeg';
import gameAssist from '../../assets/gameAssist.jpeg';
import { registerServiceWorker } from '../../services/notificationService.js';
import NotificationsIcon from '@mui/icons-material/Notifications';

const BasePage = () => {
    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [resetForm, setResetForm] = useState(false);
    const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });
    const [onSubmitHandler, setOnSubmitHandler] = useState(() => { });
    const [buttonText, setButtonText] = useState(Constant.EMPTY);
    const [dialogTitle, setDialogTitle] = useState(Constant.EMPTY);
    const [placeholderText, setPlaceholderText] = useState(Constant.EMPTY);
    const [openGroupCode, setOpenGroupCode] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const navigate = useNavigate();
    const userId = localStorage.getItem(USER_KEY);

    const enableNotifications = async (userId) => {
        try {
            // Check if the permission is already denied
            if (Notification?.permission === 'denied') {
                alert('Notifications have been blocked. Please enable notifications from your browser settings.');
                return;
            }

            // Request permission if it's not already granted
            const permission = await Notification.requestPermission();

            if (permission === 'granted' || Notification?.permission === 'granted'
                || permission === 'default' || Notification?.permission === 'default') {
                await registerServiceWorker(userId);
                return;
            }
            console.warn('User denied notification permission');

        } catch (error) {
            console.error('Failed to enable notifications:', error);
        }
    };

    const onClickCreateGroup = () => {
        setResetForm(true);
        setOpenCreateGroup(true);
    };

    const onClickGameZone = () => {
        navigate(Constant.ROUTE_PATH.GAME_ZONE)
    };

    const onClickGameAssist = () => {
        setResetForm(true);
        if (localStorage.getItem(GROUP_ID_KEY)) {
            navigate(Constant.ROUTE_PATH.GAME_ASSIST);
            return;
        } else {
            setOnSubmitHandler(() => handleGroupCodeSubmit);
            setPlaceholderText(Constant.GAME_ASSIST_PLACEHOLDER_TEXT);
            setButtonText(Constant.GAME_ASSIST);
            setDialogTitle(Constant.GAME_ASSIST_TITLE);
            setOpenGroupCode(true);
        }
    };

    const handleGroupCodeSubmit = async (groupCode) => {
        try {
            const response = await gameAssistHandler({ userId, groupCode });
            if (response) {
                return { groupId: response, path: Constant.ROUTE_PATH.GAME_ASSIST };
            }
        } catch (error) {
            throw error;
        }
    };

    const handleCloseGroupAssist = () => {
        setResetForm(false);
        setOpenGroupCode(false);
        navigate(Constant.ROUTE_PATH.HOME);
    };

    const handleCloseCreateGroup = () => {
        setResetForm(false);
        setOpenCreateGroup(false);
    };

    const closeErrorPopUp = () => {
        setErrorPopUp({ message: Constant.EMPTY, show: false });
    };

    const cards = [
        { text: 'Create Group', onClick: onClickCreateGroup, bgImage: funZoneGroup },
        { text: 'Game Zone', onClick: onClickGameZone, bgImage: gameZone },
        { text: 'Game Assist', onClick: onClickGameAssist, bgImage: gameAssist }
    ];

    return (
        <div style={Constant.FUN_ZONE_STYLE} className='base-page-container'>
            <div><Navbar title={'FUN ZONE'} /></div>
            <Box sx={{ pr: 4,  pt: isSmallScreen ? 15 : 35, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
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
                                        width: isSmallScreen ? '75%' : '100%',
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
            </Box>

            {openCreateGroup && (
                <CreateGroup
                    open={openCreateGroup}
                    onClose={handleCloseCreateGroup}
                    resetForm={resetForm}
                />
            )}

            <CodeDialog
                open={openGroupCode}
                onClose={handleCloseGroupAssist}
                buttonText={buttonText}
                dialogTitle={dialogTitle}
                onSubmit={onSubmitHandler}
                resetForm={resetForm}
                placeholderText={placeholderText}
            ></CodeDialog>

            {errorPopUp.show && (
                <ErrorComponent
                    message={errorPopUp.message}
                    show={errorPopUp.show}
                    onClose={closeErrorPopUp}
                />
            )}

            {/* Notification Toggle */}
            (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <IconButton
                        onClick={() => enableNotifications(userId)}
                        sx={{
                            color: '#4caf50',
                            fontSize: '30px',
                        }}
                    >
                        <NotificationsIcon />
                    </IconButton>
                </Box>
            )
        </div>
    );
};

export default BasePage;
