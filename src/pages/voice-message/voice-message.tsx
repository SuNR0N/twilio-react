import React, { FC, useState, ChangeEvent } from 'react';
import { Button, Grid, TextField } from '@material-ui/core';

import { useFetch } from '../../hooks';

interface FormFields {
  from?: string;
  to?: string;
  message?: string;
}

export const VoiceMessage: FC = () => {
  const [formFields, setFormFields] = useState<FormFields>({});
  const { from, message, to } = formFields;
  const [, sendTextMessage] = useFetch('/api/calls', {
    body: JSON.stringify({ to, from, message }),
    method: 'POST',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFormFields({
      ...formFields,
      [target.name]: target.value,
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TextField name="from" onChange={handleInputChange} fullWidth label="From" variant="outlined" />
      </Grid>
      <Grid item xs={6}>
        <TextField name="to" onChange={handleInputChange} fullWidth label="To" variant="outlined" />
      </Grid>
      <Grid item xs={12}>
        <TextField name="message" onChange={handleInputChange} fullWidth label="Message" multiline rows={4} variant="outlined" />
      </Grid>
      <Grid container justify="center" alignItems="center" item xs={12}>
        <Button onClick={() => sendTextMessage()} variant="contained" color="primary" disableElevation>
          Send Voice Message
        </Button>
      </Grid>
    </Grid>
  );
};
