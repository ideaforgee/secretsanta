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
  const [teams, setTeams] = useState([]);
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
      const shuffledMembers = [...checkedMembers].sort(() => 0.5 - Math.random());
      const teams = [];
      const teamSize = checkedMembers.length / teamData.numberOfTeams;

      let startIndex = 0;
      for (let i = 0; i < teamData.numberOfTeams; i++) {
        teams.push(shuffledMembers.slice(startIndex, startIndex + teamSize));
        startIndex += teamSize;
      }

      setTeams(teams);
    } catch (error) {
      showAlert(error || 'An error occurred while creating teams.', Constant.ERROR);
    }
  };

  const viewTeams = () => {
    onClose();
    navigate(Constant.ROUTE_PATH.TEAMS, { state: { teams: teams } });
  };

  useEffect(() => {
    if (resetPrompt) {
      setTeamData(new Team());
      setSubmitted(false);
      getTeamMembers();
      setTeams([]);
    }
  }, [resetPrompt]);

  useEffect(() => {
    if (teamData.players && teamData.numberOfTeams) {
      const checkedMembers = teamData.players.filter((member) => member.checked);
      if (checkedMembers.length > 0 && teamData.numberOfTeams > 0) {
        setCanCreateTeams(checkedMembers.length % teamData.numberOfTeams !== 0);
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
            Divide Teams
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            style={{ marginTop: '10px' }}
            label='Number of Teams'
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
            Create
          </Button>
          <Button onClick={viewTeams} color='primary' disabled={canCreateTeams || !teams.length}>
            View Teams
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