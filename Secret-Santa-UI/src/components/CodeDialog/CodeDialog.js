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
import './CodeDialog.css';
import * as Constant from '../../constants/secretSantaConstants';
import { GAME_ID_KEY } from '../../constants/appConstant';
import { useAlert } from '../../context/AlertContext.js';
import { useNavigate } from 'react-router-dom';
import ErrorComponent from '../Error/ErrorComponent.js';

const GAME_CODE_REGEX = /^[a-zA-Z0-9]+$/;
const GAME_CODE_LENGTH = 8;

function CodeDialog({ open, onClose, buttonText, dialogTitle, onSubmit, resetForm }) {
    const navigate = useNavigate();
    const [gameCode, setGameCode] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { showAlert } = useAlert();
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitted(true);

        if (gameCode && gameCode.length === GAME_CODE_LENGTH && GAME_CODE_REGEX.test(gameCode)) {
            try {
                const response = await onSubmit(gameCode);
                if (response.gameId) {
                    localStorage.setItem(GAME_ID_KEY, response.gameId);
                    showAlert(Constant.ALERT_MESSAGES.SUCCESSFULLY_JOINED, Constant.SUCCESS);
                    navigate(response.path);
                } else {
                    showAlert(Constant.ALERT_MESSAGES.INVALID_CODE, Constant.ERROR);
                }
            } catch (error) {
                setErrorPopUp({
                    message: error || Constant.POPUP_ERROR_MESSAGE,
                    show: true,
                });
            }
        } else {
            showAlert(Constant.ALERT_MESSAGES.INVALID_CODE, Constant.ERROR);
        }
    };

    const closeErrorPopUp = () => {
        setErrorPopUp({ message: '', show: false });
    };

    useEffect(() => {
        setGameCode('');
        setSubmitted(false);
    }, [resetForm]);

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
            fullWidth
            sx={{
                overflowX: 'hidden',
            }}
        >
            <DialogTitle className='dialog-title-code'>
                <Typography variant='body1' align='center' className='dialog-title-text-code'>
                    {dialogTitle}
                </Typography>
            </DialogTitle>
            <DialogContent className='dialog-content'>
                <form fullWidth onSubmit={handleSubmit} className='code-form'>
                    <TextField
                        label='Enter Game Code'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        error={submitted && !gameCode}
                        helperText={submitted && !gameCode ? 'Game Code cannot be empty' : ''}
                        className='input-field'
                        inputProps={{ maxLength: GAME_CODE_LENGTH }}
                    />
                    <DialogActions className='dialog-actions'>
                        <Button onClick={onClose} className='cancel-button'>
                            CANCEL
                        </Button>
                        <Button type='submit' className='join-button'>
                            {buttonText}
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
            <ErrorComponent
                message={errorPopUp.message}
                show={errorPopUp.show}
                onClose={closeErrorPopUp}
            />
        </Dialog>
    );
}

export default CodeDialog;
