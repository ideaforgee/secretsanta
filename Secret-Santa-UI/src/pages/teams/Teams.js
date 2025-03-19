import React from 'react';
import { Card, CardContent, Typography, Grid2 } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

const lemonYellow = '#FFECB3';

const StyledCard = styled(Card)(({ theme, backgroundColor }) => ({
  height: '300px',
  width: '300px',
  backgroundColor: backgroundColor,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  display: 'flex',
  flexDirection: 'column',
}));

const CardContentStyled = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

const MemberList = styled('ul')({
  listStyleType: 'none',
  padding: 0,
  flexGrow: 1,
});

const MemberListItem = styled('li')({
  padding: '8px 0',
  borderBottom: '1px solid #eee',
});

function Teams() {
  const location = useLocation();
  const teams = location.state?.teams;

  if (!teams || teams.length === 0) {
    return <Typography>No teams created yet.</Typography>;
  }

  return (
    <Grid2 container spacing={4} justifyContent="center" alignItems="center" style={{ minHeight: '80vh', padding: '40px' }}>
      {teams.map((team, index) => (
        <Grid2 item key={index}>
          <StyledCard backgroundColor={lemonYellow}>
            <CardContentStyled>
              <Typography variant="h5" component="div">
                Team {index + 1}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Members:
              </Typography>
              <MemberList>
                {team.map((member) => (
                  <MemberListItem key={member.userId}>
                    {member.userName}
                  </MemberListItem>
                ))}
              </MemberList>
            </CardContentStyled>
          </StyledCard>
        </Grid2>
      ))}
    </Grid2>
  );
}

export default Teams;