import React, { ChangeEvent, FC, useContext, useEffect, useState } from 'react';
import { Button, Grid, Snackbar, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Connection, Device } from 'twilio-client';

import { useDevice } from '../../hooks';
import { ConfigContext } from '../../contexts/config-context';
import { Dialpad } from '../../components';

interface FormFields {
  to?: string;
}

export const Call: FC = () => {
  const from = useContext(ConfigContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [connection, setConnection] = useState<Connection>();
  const [incomingConnection, setIncomingConnection] = useState<Connection>();
  const [device, isDeviceReady] = useDevice({ debug: true });
  const [formFields, setFormFields] = useState<FormFields>({});
  const { to: number } = formFields;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setFormFields({
      ...formFields,
      [target.name]: target.value,
    });
  };

  const handleClose = () => {
    setShowNotifications(false);
  };

  const answer = () => {
    incomingConnection?.accept();
  };

  const call = () => {
    if (device && isDeviceReady && number) {
      device.connect({ phoneNumber: number });
    }
  };

  const hangUp = () => {
    if (incomingConnection) {
      incomingConnection.reject();
      setIncomingConnection(undefined);
    }
    device.disconnectAll();
  };

  const handleKeyPress = (key: string) => {
    connection?.sendDigits(key);
  };

  useEffect(() => {
    device.on('connect', (conn: Connection) => {
      console.log('[Connect] >>>', conn);
      setConnection(conn);
    });
    device.on('disconnect', (conn: Connection) => {
      console.log('[Disconnect] >>>', conn);
      setConnection(undefined);
      setIncomingConnection(undefined);
    });
    device.on('cancel', (conn: Connection) => {
      console.log('[Cancel] >>>', conn);
      setIncomingConnection(undefined);
    });
    device.on('incoming', (conn: Connection) => {
      console.log('[Incoming] >>>', conn);
      setIncomingConnection(conn);
      setShowNotifications(true);
    });
  }, [device]);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {from && <TextField name="from" defaultValue={from} fullWidth label="From" variant="outlined" disabled />}
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="to"
            onChange={handleInputChange}
            fullWidth
            label="To"
            variant="outlined"
            disabled={
              !isDeviceReady ||
              device.status() !== Device.Status.Ready ||
              !!incomingConnection ||
              (connection && connection.status() !== Connection.State.Closed)
            }
          />
        </Grid>
        <Dialpad onKeyPress={handleKeyPress} />
        <Grid container justify="center" alignItems="center" item xs={12} spacing={3}>
          <Grid item>
            <Button
              onClick={() => call()}
              variant="contained"
              color="primary"
              disableElevation
              disabled={!isDeviceReady || device.status() !== Device.Status.Ready || !!incomingConnection}
            >
              Call
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => answer()}
              variant="contained"
              disableElevation
              disabled={!isDeviceReady || device.status() !== Device.Status.Ready || !incomingConnection}
            >
              Answer
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => hangUp()}
              variant="contained"
              color="secondary"
              disableElevation
              disabled={!(incomingConnection || (connection && connection.status() !== Connection.State.Closed))}
            >
              Hang Up
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Snackbar open={showNotifications} autoHideDuration={5000} onClose={handleClose}>
        {incomingConnection && (
          <Alert onClose={handleClose} severity="info">
            Incoming call from: {incomingConnection.parameters.From}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};
