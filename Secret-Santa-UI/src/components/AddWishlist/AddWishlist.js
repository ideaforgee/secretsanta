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
import Wishlist from '../../models/Wishlist';
import './AddWishlist.css';
import * as Constant from '../../constants/secretSantaConstants';
import { USER_KEY, GAME_ID_KEY } from '../../constants/appConstant';
import { useAlert } from '../../context/AlertContext.js';
import { addWishToMineWishList } from '../../services/wishlistService.js';
import ErrorComponent from '../Error/ErrorComponent.js';


function AddWishlist({ open, onClose, resetForm, refreshWishlist }) {
    const [wishlistData, setWishlistData] = useState(new Wishlist());
    const [submitted, setSubmitted] = useState(false);
    const { showAlert } = useAlert();
    const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });

    const handleAddWishlist = async (event) => {
        event.preventDefault();
        setSubmitted(true);

        const userId = localStorage.getItem(USER_KEY);
        const gameId = localStorage.getItem(GAME_ID_KEY);

        if (!userId) {
            showAlert(Constant.ALERT_MESSAGES.NOT_LOGGED_IN, Constant.ERROR);
            return;
        }

        if (!gameId) {
            showAlert(Constant.ALERT_MESSAGES.GAME_NOT_CREATED, Constant.ERROR);
            return;
        }

        if (wishlistData.productName && wishlistData.productLink) {
            await addProductToWishlist(userId, gameId, wishlistData);
        } else {
            showAlert(Constant.ALERT_MESSAGES.REQUIRED_FIELDS, Constant.ERROR);
        }
    };

    const addProductToWishlist = async (userId, gameId, wishlistData) => {
        try {
            await addWishToMineWishList(userId, gameId, wishlistData);
            showAlert(Constant.ALERT_MESSAGES.SUCCESSFULLY_ADDED, Constant.SUCCESS);
            refreshWishlist();
            onClose();
        } catch (error) {
            setErrorPopUp({
                message: error?.message || Constant.POPUP_ERROR_MESSAGE,
                show: true,
            });
        }
    };

    const closeErrorPopUp = () => {
        setErrorPopUp({ message: '', show: false });
    };

    const handleInputChange = (field, value) => {
        setWishlistData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (resetForm) {
            setWishlistData(new Wishlist());
            setSubmitted(false);
        }
    }, [resetForm]);

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason === Constant.DIALOG_REASONS.BACKDROP_CLICK) return;
                onClose();
            }}
            maxWidth='sm'
        >
            <DialogTitle className='dialog-title'>
                <Typography variant='body1' align='center' className='dialog-title-text'>
                    ADD WISHLIST
                </Typography>
            </DialogTitle>
            <DialogContent className='dialog-content'>
                <form className='add-wishlist-form' onSubmit={handleAddWishlist}>
                    <TextField
                        label='Product Name'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={wishlistData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        error={submitted && !wishlistData.productName}
                        helperText={submitted && !wishlistData.productName ? 'Product Name is required' : ''}
                        className='input-field'
                    />
                    <TextField
                        label='Product Link'
                        fullWidth
                        margin='normal'
                        variant='outlined'
                        value={wishlistData.productLink}
                        onChange={(e) => handleInputChange('productLink', e.target.value)}
                        error={submitted && !wishlistData.productLink}
                        helperText={submitted && !wishlistData.productLink ? 'Product Link is required' : ''}
                        className='input-field'
                    />
                    <DialogActions className='dialog-actions'>
                        <Button onClick={onClose} className='cancel-button'>
                            CANCEL
                        </Button>
                        <Button type='submit' className='add-wishlist-button'>
                            ADD
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

export default AddWishlist;
