import React, { useState } from 'react';
import './BasePage.css';
import CreateGroup from '../create-group/CreateGroup';
import * as Constant from '../../constants/secretSantaConstants.js';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import Navbar from "../../components/navbar/Navbar";
import CodeDialog from '../../components/CodeDialog/CodeDialog';

const BasePage = () => {
    const [openCreateGroup, setOpenCreateGroup] = useState(false);
    const [resetForm, setResetForm] = useState(false);
    const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });
    const [onSubmitHandler, setOnSubmitHandler] = useState(() => { });
    const [buttonText, setButtonText] = useState(Constant.EMPTY);
    const [dialogTitle, setDialogTitle] = useState(Constant.EMPTY);
    const [placeholderText, setPlaceholderText] = useState(Constant.EMPTY);
    const [openGroupCode, setOpenGroupCode] = useState(false);
    const navigate = useNavigate();

    const onClickCreateGroup = () => {
        setResetForm(true);
        setOpenCreateGroup(true);
    };


    const onClickGameZone = () => {
        navigate(Constant.ROUTE_PATH.GAME_ZONE)
    };


    const onClickGameAssist = () => {
        setResetForm(true);
        setOnSubmitHandler(() => handleGroupCodeSubmit);
        setPlaceholderText(Constant.GAME_ASSIST_PLACEHOLDER_TEXT);
        setButtonText(Constant.GAME_ASSIST);
        setDialogTitle(Constant.GAME_ASSIST_TITLE);
        setOpenGroupCode(true);

    };

    const handleGroupCodeSubmit = () => {
        navigate(Constant.ROUTE_PATH.GAME_ASSIST);
    };

    const handleCloseJoinGame = () => {
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
        { text: 'Create Group', onClick: onClickCreateGroup },
        { text: 'Game Zone', onClick: onClickGameZone },
        { text: 'Game Assist', onClick: onClickGameAssist }
    ];

    return (
        <div style={Constant.FUN_ZONE_STYLE} className='base-page-container'>
            <div><Navbar title={'FUN ZONE'}/></div>
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
            {openCreateGroup && (
                <CreateGroup
                    open={openCreateGroup}
                    onClose={handleCloseCreateGroup}
                    resetForm={resetForm}
                />
            )}

            <CodeDialog
                open={openGroupCode}
                onClose={handleCloseJoinGame}
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
        </div>
    );
};

export default BasePage;
