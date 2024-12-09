import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import './HostGame.css';
import Game from '../../models/Game';
import { hostGameHandler } from '../../services/gameService.js';
import * as Constant from '../../constants/secretSantaConstants';
import { USER_KEY } from '../../constants/appConstant';
import { useAlert } from './../../context/AlertContext.js';
import ErrorComponent from '../Error/ErrorComponent.js';

function HostGame({ open, onClose, resetForm }) {
    const [gameData, setGameData] = useState(new Game());
    const [submitted, setSubmitted] = useState(false);
    const { showAlert } = useAlert();
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });

    const handleInputChange = (field, value) => {
        setGameData((prev) => {
            const updatedGameData = new Game(
                prev.gameName,
                prev.startDate,
                prev.endDate,
                prev.maxPlayers
            );
            updatedGameData[field] = value;
            return updatedGameData;
        });
    };

    useEffect(() => {
        if (resetForm) {
            setGameData(new Game());
            setSubmitted(false);
        }
    }, [resetForm]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSubmitted(true);
        const userId = localStorage.getItem(USER_KEY);

        if (!userId) {
            showAlert(Constant.ALERT_MESSAGES.NOT_LOGGED_IN, Constant.ERROR);
            return;
        }

        if (gameData.gameName && gameData.startDate && gameData.endDate && gameData.maxPlayers) {
            if (!gameData.isValidStartDate()) {
                showAlert(Constant.ALERT_MESSAGES.INVALID_START_DATE, Constant.ERROR);
                return;
            }
            if (!gameData.isValidEndDate()) {
                showAlert(Constant.ALERT_MESSAGES.INVALID_END_DATE, Constant.ERROR);
                return;
            }
            if (!(gameData.maxPlayers >= 2)) {
                showAlert(Constant.ALERT_MESSAGES.INVALID_MAX_PLAYERS, Constant.ERROR);
                return;
            }

            const formattedGameData = {
                ...gameData,
                startDate: gameData.startDate.toISOString().split('T')[0],
                endDate: gameData.endDate.toISOString().split('T')[0]
            };

            const payload = {
                userId,
                formattedGameData
            };
            await hostGame(payload);
            onClose();
        } else {
            showAlert(Constant.ALERT_MESSAGES.REQUIRED_FIELDS, Constant.ERROR);
        }
    };

    const hostGame = async (payload) => {
        try {
            const response = await hostGameHandler(payload.userId, payload.formattedGameData);
            showAlert(Constant.ALERT_MESSAGES.GAME_HOSTED, Constant.SUCCESS);
            return response;
        } catch (error) {
            setErrorPopUp({
                message: error || Constant.POPUP_ERROR_MESSAGE,
                show: true
            });
        }
    };

    const closeErrorPopUp = () => {
        setErrorPopUp({ message: '', show: false });
    };

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason === Constant.DIALOG_REASONS.BACKDROP_CLICK) {
                    return;
                }
                onClose();
            }}
            maxWidth='sm'
        >
            <DialogTitle className='dialog-title-host-game'>
                <Typography variant='body1' align='center' className='dialog-title-text-host-game'>
                    Host Game
                </Typography>
            </DialogTitle>
            <DialogContent className='dialog-content'>
                <form onSubmit={handleCreate} className='host-game-form'>
                    <TextField
                        label='Game Name'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={gameData.gameName}
                        onChange={(e) => handleInputChange('gameName', e.target.value)}
                        error={submitted && !gameData.gameName}
                        helperText={submitted && !gameData.gameName ? 'Game name is required' : ''}
                        className='input-field'
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                            label='Start Date'
                            inputFormat='MM/dd/yyyy'
                            value={gameData.startDate}
                            onChange={(date) => {
                                handleInputChange('startDate', date);
                                handleInputChange('endDate', null);
                            }}
                            minDate={tomorrow}
                            className='date-picker-wrapper'
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin='normal'
                                    error={submitted && !gameData.startDate}
                                    helperText={
                                        submitted && !gameData.startDate
                                            ? 'Start Date is required'
                                            : ''
                                    }
                                    className='date-picker-input'
                                />
                            )}
                        />
                        <DesktopDatePicker
                            label='End Date'
                            inputFormat='MM/dd/yyyy'
                            value={gameData.endDate}
                            onChange={(date) => handleInputChange('endDate', date)}
                            className='date-picker-wrapper'
                            minDate={gameData.startDate || tomorrow}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin='normal'
                                    error={submitted && !gameData.endDate}
                                    helperText={
                                        submitted && !gameData.endDate
                                            ? 'End Date is required'
                                            : ''
                                    }
                                    className='date-picker-input'
                                />
                            )}
                        />
                    </LocalizationProvider>
                    <TextField
                        label='Maximum Players'
                        type='number'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={gameData.maxPlayers}
                        onChange={(e) => handleInputChange('maxPlayers', e.target.value)}
                        error={submitted && !gameData.maxPlayers}
                        helperText={
                            submitted && !gameData.maxPlayers
                                ? 'Maximum Players are required'
                                : ''
                        }
                        className='input-field'
                    />
                    <DialogActions className='dialog-actions'>
                        <Button onClick={onClose} className='cancel-button'>
                            CANCEL
                        </Button>
                        <Button type='submit' className='create-button'>
                            HOST
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
            <ErrorComponent
                message={errorPopUp.message}
                show={errorPopUp.show}
                onClose={closeErrorPopUp}
            ></ErrorComponent>
        </Dialog>
    );
}

export default HostGame;
