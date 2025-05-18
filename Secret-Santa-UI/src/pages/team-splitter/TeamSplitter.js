import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, Typography, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import * as Constant from '../../constants/secretSantaConstants';
import Team from '../../models/Team';
import TeamMembers from '../../components/TeamMembers/TeamMembers';
import { GROUP_ID_KEY } from '../../constants/appConstant';
import * as groupService from '../../services/groupService.js';
import { useAlert } from '../../context/AlertContext.js';
import { useNavigate } from 'react-router-dom';
import './TeamSplitter.css';

function TeamSplitter({ open, onClose, resetPrompt }) {
  const [teamData, setTeamData] = useState(new Team());
  const [submitted, setSubmitted] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const groupId = localStorage.getItem(GROUP_ID_KEY);
  const { showAlert } = useAlert();
  const [canCreateTeams, setCanCreateTeams] = useState(false);
  const navigate = useNavigate();

  const handleTeamChange = (field, value) => {
    setTeamData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTeamMembersChange = (selectedTeamMembers) => {
    setTeamData(prev => ({
      ...prev,
      players: selectedTeamMembers,
    }));
  };

  const handleSelectTeamMembers = () => {
    setMembersDialogOpen(true);
  };

  const getTeamMembers = async () => {
    try {
      const response = await groupService.getGroupMembersHandler(groupId);
      if (response) {
        setTeamData(prev => ({
          ...prev,
          players: response.map((member) => ({ ...member, checked: true })),
        }));
      } else {
        setTeamData(prev => ({
          ...prev,
          players: [],
        }));
      }
    } catch (error) {
      showAlert(error, Constant.ERROR);
    }
  };

  const createTeams = () => {
    setSubmitted(true);
    if (!teamData.numberOfTeams || !teamData.players?.length) {
      return;
    }

    try {
      const checkedMembers = teamData.players.filter((member) => member.checked);
      const membersPerTeam = parseInt(teamData.numberOfTeams, 10);
      
      if (membersPerTeam <= 0 || membersPerTeam > checkedMembers.length) {
        showAlert('Number of members per team must be greater than 0 and less than or equal to the selected members.', Constant.ERROR);
        return;
      }

      const shuffledMembers = [...checkedMembers].sort(() => 0.5 - Math.random());
      const teams = [];
      let startIndex = 0;

      while (startIndex < shuffledMembers.length) {
        teams.push(shuffledMembers.slice(startIndex, startIndex + membersPerTeam));
        startIndex += membersPerTeam;
      }

      onClose();
      navigate(Constant.ROUTE_PATH.TEAMS, { state: { teams: teams } });
    } catch (error) {
      showAlert(error || 'An error occurred while creating teams.', Constant.ERROR);
    }
  };

  useEffect(() => {
    if (resetPrompt) {
      setTeamData(new Team());
      setSubmitted(false);
      getTeamMembers();
    }
  }, [resetPrompt]);

  useEffect(() => {
    if (teamData.players && teamData.numberOfTeams) {
      const checkedMembers = teamData.players.filter((member) => member.checked);
      const membersPerTeam = parseInt(teamData.numberOfTeams, 10);

      if (
        checkedMembers.length > 0 &&
        membersPerTeam > 0 &&
        membersPerTeam <= checkedMembers.length
      ) {
        setCanCreateTeams(false);
      } else {
        setCanCreateTeams(true);
      }
    } else {
      setCanCreateTeams(true);
    }
  }, [teamData.players, teamData.numberOfTeams]);

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === Constant.DIALOG_REASONS.BACKDROP_CLICK) {
            return;
          }
          onClose();
        }}
        fullWidth
      >
        <DialogTitle className='team-splitter-dialog-title-container'>
          <Typography variant="h6" className='team-splitter-dialog-title'>
            Split Teams
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            style={{ marginTop: '10px' }}
            label='Number of Members per Team'
            variant='outlined'
            value={teamData.numberOfTeams}
            onChange={(e) => handleTeamChange('numberOfTeams', e.target.value)}
            error={submitted && !teamData.numberOfTeams}
            helperText={submitted && !teamData.numberOfTeams ? 'Number of Team Members is required' : ''}
            fullWidth
          />
          <Button
            style={{ marginTop: '10px' }}
            className='team-splitter-select-recipients-button'
            onClick={handleSelectTeamMembers}
            variant='outlined'
          >
            Select Team Members
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={createTeams} color='primary' disabled={canCreateTeams}>
            Split
          </Button>
        </DialogActions>
      </Dialog>

      <TeamMembers
        open={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        members={teamData.players}
        onMembersChange={handleTeamMembersChange}
      ></TeamMembers>
    </>
  );
}

export default TeamSplitter;