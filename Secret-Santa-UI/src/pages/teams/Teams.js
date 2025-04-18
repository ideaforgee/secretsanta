import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import * as Constant from '../../constants/secretSantaConstants';

const lemonYellow = '#ACD2F2';

const StyledCard = styled(Card)(({ backgroundColor }) => ({
  minHeight: '300px',
  minWidth: '250px',
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
    <div style={Constant.FUN_ZONE_STYLE}>
      <div
        style={{
          height: '100vh',
          overflowY: 'auto',
          paddingTop: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundImage: Constant.FUN_ZONE_STYLE
        }}
      >
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          {teams.map((team, index) => (
            <Grid item key={index}>
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
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default Teams;
