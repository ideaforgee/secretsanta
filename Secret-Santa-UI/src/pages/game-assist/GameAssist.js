import React from 'react'
import { Box, Card, Typography } from '@mui/material';

function GameAssist() {
    const cards = [
        { text: 'Game Announcement', onClick: () => {} },
        { text: 'Team Splitter', onClick: () => {} },
        { text: 'Buzzer Timer', onClick: () => {} },
        { text: 'Team Discussion', onClick: () => {} },
    ];
  return (
    <div className='game-zone-container'>
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
        </div>
  )
}

export default GameAssist