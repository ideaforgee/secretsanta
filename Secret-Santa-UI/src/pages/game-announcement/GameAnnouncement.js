import { Dialog, DialogTitle, Typography, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import "./GameAnnouncement.css";
import Email from '../../models/Email';
import * as Constant from '../../constants/secretSantaConstants';
import TeamMembers from '../../components/TeamMembers/TeamMembers';
import { GROUP_ID_KEY, USER_KEY } from '../../constants/appConstant';
import * as groupService from '../../services/groupService.js';
import { useAlert } from '../../context/AlertContext.js';
import CampaignTwoToneIcon from '@mui/icons-material/CampaignTwoTone';

function GameAnnouncement({ open, onClose, resetPrompt }) {

  const [emailData, setEmailData] = useState(new Email());
  const [submitted, setSubmitted] = useState(false);
  const [recipientsDialogOpen, setRecipientsDialogOpen] = useState(false);
  const groupId = localStorage.getItem(GROUP_ID_KEY);
  const userId = localStorage.getItem(USER_KEY);
  const { showAlert } = useAlert();

  const handleEmailChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getGroupMembers = async () => {
    try {
      const response = await groupService.getGroupMembersHandler(groupId);
      if (response) {
        setEmailData(prev => ({
          ...prev,
          recipients: response.map(member => ({ ...member, checked: true }))
        }));
      } else {
        setEmailData(prev => ({
          ...prev,
          recipients: []
        }));
      }
    } catch (error) {
      showAlert(error, Constant.ERROR);
    }
  };

  useEffect(() => {
    if (resetPrompt) {
      setEmailData(new Email());
      setSubmitted(false);
      getGroupMembers();
    }
  }, [resetPrompt]);

  const handleSendEmail = async () => {
    setSubmitted(true);
    if (!emailData.subject || !emailData.body || !emailData.recipients.length) {
      return;
    }

    const recipientIds = emailData.recipients.filter(recipient => recipient.checked).map(recipient => recipient.userId);
    const payload = { userId, emailData: { ...emailData, recipients: recipientIds } };
    
    await groupService.announceGameHandler(payload);
    onClose();
  };


  const handleSelectRecipients = () => {
    setRecipientsDialogOpen(true);
  };

  const handleRecipientsChange = (selectedRecipients) => {
    setEmailData(prev => ({
      ...prev,
      recipients: selectedRecipients
    }));
  };

  return (
    <>
      <Dialog open={open}
        onClose={(event, reason) => {
          if (reason === Constant.DIALOG_REASONS.BACKDROP_CLICK) {
            return;
          }
          onClose();
        }}
        fullWidth>
        <DialogTitle className='game-announcement-dialog-title-container'>
          <Typography variant='h6' className='game-announcement-dialog-title'>Send Email</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='subtitle1' className='game-announcement-dialog-subtitle'>Email Subject</Typography>
          <TextField
            fullWidth
            label='Enter Email Subject'
            value={emailData.subject}
            onChange={(e) => handleEmailChange('subject', e.target.value)}
            error={submitted && !emailData.subject}
            helperText={submitted && !emailData.subject ? 'Subject is required' : ''}
          />
          <Typography variant='subtitle1' className='game-announcement-dialog-subtitle'>Email Body</Typography>
          <TextField
            fullWidth
            label='Enter Email Body'
            value={emailData.body}
            onChange={(e) => handleEmailChange('body', e.target.value)}
            multiline
            rows={10}
            inputProps={{ style: { resize: 'vertical' } }}
            error={submitted && !emailData.body}
            helperText={submitted && !emailData.body ? 'Body is required' : ''}
          />
          <Button
            className='game-announcement-select-recipients-button'
            onClick={handleSelectRecipients}
            variant='outlined'
          >
            Select Recipients
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='secondary'>Cancel</Button>
          <Button onClick={handleSendEmail} color='primary'><CampaignTwoToneIcon/> Announce</Button>
        </DialogActions>
      </Dialog>
      <TeamMembers
        open={recipientsDialogOpen}
        onClose={() => setRecipientsDialogOpen(false)}
        members={emailData.recipients}
        onMembersChange={handleRecipientsChange}
      ></TeamMembers>
    </>
  );
}

export default GameAnnouncement;