import React, { FC, useState, ChangeEvent, useContext } from 'react';
import { Button, Grid, TextField } from '@material-ui/core';

import { useFetch } from '../../hooks';
import { ConfigContext } from '../../contexts/config-context';

interface FormFields {
  to?: string;
  message?: string;
}

export const TextMessage: FC = () => {
  const from = useContext(ConfigContext);
  const [formFields, setFormFields] = useState<FormFields>({});
  const { message, to } = formFields;
  const [, sendTextMessage] = useFetch('/api/messages', {
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
        {from && <TextField name="from" defaultValue={from} fullWidth label="From" variant="outlined" disabled />}
      </Grid>
      <Grid item xs={6}>
        <TextField name="to" onChange={handleInputChange} fullWidth label="To" variant="outlined" />
      </Grid>
      <Grid item xs={12}>
        <TextField name="message" onChange={handleInputChange} fullWidth label="Message" multiline rows={4} variant="outlined" />
      </Grid>
      <Grid container justify="center" alignItems="center" item xs={12}>
        <Button onClick={() => sendTextMessage()} variant="contained" color="primary" disableElevation>
          Send Text Message
        </Button>
      </Grid>
    </Grid>
  );
};
