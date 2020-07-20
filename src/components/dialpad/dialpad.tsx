import React, { FC } from 'react';
import { Button, Grid } from '@material-ui/core';
import { CallTwoTone as Call, CallEndTwoTone as CallEnd } from '@material-ui/icons';

import './dialpad.scss';

interface DialpadProps {
  acceptDisabled?: boolean;
  declineDisabled?: boolean;
  keysDisabled?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onKeyPress?: (key: string) => void;
}

export const Dialpad: FC<DialpadProps> = ({ acceptDisabled, declineDisabled, keysDisabled, onAccept, onDecline, onKeyPress }) => {
  const handleKeyPress = (key: string) => () => {
    if (onKeyPress) {
      onKeyPress(key);
    }
  };

  return (
    <Grid className="dialpad" container justify="center" alignItems="center" item xs={12}>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('1')} disabled={keysDisabled}>
            1
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('2')} disabled={keysDisabled}>
            2
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('3')} disabled={keysDisabled}>
            3
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('4')} disabled={keysDisabled}>
            4
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('5')} disabled={keysDisabled}>
            5
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('6')} disabled={keysDisabled}>
            6
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('7')} disabled={keysDisabled}>
            7
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('8')} disabled={keysDisabled}>
            8
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('9')} disabled={keysDisabled}>
            9
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('*')} disabled={keysDisabled}>
            *
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('0')} disabled={keysDisabled}>
            0
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" size="large" onClick={handleKeyPress('#')} disabled={keysDisabled}>
            #
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" onClick={onAccept} disabled={acceptDisabled}>
            <Call fontSize="large" style={{ color: 'green' }} />
          </Button>
        </Grid>
        <Grid container justify="center" item xs={2} sm={2} md={1}>
          <Button variant="outlined" onClick={onDecline} disabled={declineDisabled}>
            <CallEnd fontSize="large" color="secondary" />
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};
