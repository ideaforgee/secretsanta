import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import * as Constant from '../../constants/secretSantaConstants';
import { useAlert } from '../../context/AlertContext.js';

function TeamMembers({ open, onClose, members, onMembersChange }) {

  const [teamMembers, setTeamMembers] = useState([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (open) {
      setTeamMembers(members.filter(member => member.checked).map(member => member.userId));
    }
  }, [open, members]);

  const handleToggle = (userId) => {
    setTeamMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSave = () => {
    if(members.length) {
      const updatedMembers = members.map(member => ({
        ...member,
        checked: teamMembers.includes(member.userId)
      }));
      onMembersChange(updatedMembers);
      onClose();
    } else {
      showAlert(Constant.ALERT_MESSAGES.NO_RECIPIENTS_SELECTED, Constant.ERROR);
    }
  };

  return (
    <Dialog open={open}
      onClose={(event, reason) => {
        if (reason === Constant.DIALOG_REASONS.BACKDROP_CLICK) {
          return;
        }
        onClose();
      }}
      fullWidth>
      <DialogTitle>Select Team Members</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Checkbox
                      checked={teamMembers.includes(member.userId)}
                      onChange={() => handleToggle(member.userId)}
                    />
                  </TableCell>
                  <TableCell>{member.userName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>Cancel</Button>
        <Button onClick={handleSave} color='primary'>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeamMembers;