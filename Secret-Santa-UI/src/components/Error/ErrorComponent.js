import { keyframes } from '@emotion/react';
import { Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import React from 'react'

const fadeIn = keyframes
    `
    0% {
        opacity: 0;
        transform: translateY(-30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

const DialogContainer = styled(Box)(({ show }) => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '20px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
    width: 'auto',
    textAlign: 'center',
    opacity: show ? 1 : 0,
    transition: 'opacity 0.3s ease',
    height: 'auto',
    minWidth: '250px',
    '@media (max-width: 600px)': {
        padding: '15px 20px',
        minWidth: '200px',
    },
}));

const ErrorIcon = styled('span')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '16px',
});

const CloseButton = styled('button')({
    backgroundColor: '#fff',
    border: 'none',
    color: '#f44336',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '16px',
    padding: '8px 16px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        backgroundColor: '#f5f5f5',
    },
});

function ErrorComponent({ message, show, onClose }) {

    return (
        show && (
            <DialogContainer show={show}>
                <ErrorIcon>!</ErrorIcon>
                <Typography variant="body1">{message}</Typography>
                <CloseButton onClick={onClose}>OK</CloseButton>
            </DialogContainer>
        )
    );
}

export default ErrorComponent;