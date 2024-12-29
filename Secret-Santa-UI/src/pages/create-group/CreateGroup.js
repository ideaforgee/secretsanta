import React, { useEffect, useState } from 'react'
import * as Constant from '../../constants/secretSantaConstants';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import { useAlert } from './../../context/AlertContext.js';
import Group from '../../models/Group.js';
import { USER_KEY } from '../../constants/appConstant';
import "./CreateGroup.css"

function CreateGroup({ open, onClose, resetForm }) {
    const [groupData, setGroupData] = useState(new Group());
    const [submitted, setSubmitted] = useState(false);
    const { showAlert } = useAlert();
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });

    const handleInputChange = (field, value) => {
        setGroupData((prev) => {
            const updatedGroupData = new Group(
                prev.groupName
            );
            updatedGroupData[field] = value;
            return updatedGroupData;
        });
    };

    useEffect(() => {
        if (resetForm) {
            setGroupData(new Group());
            setSubmitted(false);
        }
    }, [resetForm]);

    const handleCreate = async (event) => {
        event.preventDefault();
        setSubmitted(true);
        const userId = localStorage.getItem(USER_KEY);

        if (!userId) {
            showAlert(Constant.ALERT_MESSAGES.NOT_LOGGED_IN, Constant.ERROR);
            return;
        }

        if (groupData.groupName && groupData.groupName !== '') {
            // const payload = {
            //     userId,
            //     groupData
            // };
            
            onClose();
        } else {
            showAlert(Constant.ALERT_MESSAGES.REQUIRED_FIELDS, Constant.ERROR);
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
            <DialogTitle className='dialog-title-create-group'>
                <Typography variant='body1' align='center' className='dialog-title-text-host-game'>
                    Host Game
                </Typography>
            </DialogTitle>
            <DialogContent className='dialog-content'>
                <form onSubmit={handleCreate} className='create-group-form'>
                    <TextField
                        label='Group Name'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={groupData.groupName}
                        onChange={(e) => handleInputChange('groupName', e.target.value)}
                        error={submitted && !groupData.gameName}
                        helperText={submitted && !groupData.gameName ? 'Group name is required' : ''}
                        className='input-field'
                    />
                    <DialogActions className='dialog-actions'>
                        <Button onClick={onClose} className='cancel-button'>
                            CANCEL
                        </Button>
                        <Button type='submit' className='create-button'>
                            CREATE
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
    )
}

export default CreateGroup