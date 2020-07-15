import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { Button, Grid, TextField } from '@material-ui/core';

import { useDevice } from '../../hooks';
import { Connection, Device } from 'twilio-client';

interface FormFields {
  number?: string;
}

export const Call: FC = () => {
  const [connection, setConnection] = useState<Connection>();
  const [device, isDeviceReady] = useDevice();
  const [formFields, setFormFields] = useState<FormFields>({});
  const { number } = formFields;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFormFields({
      ...formFields,
      [target.name]: target.value,
    });
  };

  const call = () => {
    if (device && isDeviceReady && number) {
      device.connect({ phoneNumber: number });
    }
  };

  const hangUp = () => {
    device.disconnectAll();
  };

  useEffect(() => {
    device.on('connect', (conn: Connection) => {
      setConnection(conn);
    });
    device.on('disconnect', () => {
      setConnection(undefined);
    });
  }, [device]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          name="number"
          onChange={handleInputChange}
          fullWidth
          label="Number"
          variant="outlined"
          disabled={!isDeviceReady || device.status() === Device.Status.Busy}
        />
      </Grid>
      <Grid container justify="center" alignItems="center" item xs={12} spacing={3}>
        <Grid item>
          <Button
            onClick={() => call()}
            variant="contained"
            color="primary"
            disableElevation
            disabled={!isDeviceReady || device.status() !== Device.Status.Ready}
          >
            Call
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => hangUp()}
            variant="contained"
            color="secondary"
            disableElevation
            disabled={!connection || connection.status() === Connection.State.Closed}
          >
            Hang Up
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};
