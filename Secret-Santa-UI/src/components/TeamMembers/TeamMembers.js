import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TextField } from '@mui/material';
import * as Constant from '../../constants/secretSantaConstants';
import { useAlert } from '../../context/AlertContext.js';

function TeamMembers({ open, onClose, members, onMembersChange }) {

  const [teamMembers, setTeamMembers] = useState([]);
  const [filterText, setFilterText] = useState('');
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
    if (members.length) {
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

  const filteredMembers = members.filter(member =>
    member.userName.toLowerCase().includes(filterText.toLowerCase())
  );

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
                <TableCell style={{ width: '30%', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span>Select</span>
                    <Checkbox
                      indeterminate={teamMembers.length > 0 && teamMembers.length < members.length}
                      checked={teamMembers.length === members.length && members.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTeamMembers(members.map(member => member.userId));
                        } else {
                          setTeamMembers([]);
                        }
                      }}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  Name
                  <TextField
                    variant='outlined'
                    size='small'
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map(member => (
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
        <Button onClick={handleSave} color='primary' disabled={teamMembers.length === 0}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeamMembers;