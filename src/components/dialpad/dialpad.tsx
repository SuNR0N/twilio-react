import React, { FC } from 'react';
import { Button, Grid } from '@material-ui/core';

import './dialpad.scss';

interface DialpadProps {
  onKeyPress?: (key: string) => void;
}

export const Dialpad: FC<DialpadProps> = ({ onKeyPress }) => {
  const handleKeyPress = (key: string) => () => {
    if (onKeyPress) {
      onKeyPress(key);
    }
  };

  return (
    <Grid className="dialpad" container justify="center" alignItems="center" item xs={12}>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('1')}>
            1
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('2')}>
            2
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('3')}>
            3
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('4')}>
            4
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('5')}>
            5
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('6')}>
            6
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('7')}>
            7
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('8')}>
            8
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('9')}>
            9
          </Button>
        </Grid>
      </Grid>
      <Grid className="dialpad__row" container justify="center" alignItems="center">
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('*')}>
            *
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('0')}>
            0
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button variant="outlined" onClick={handleKeyPress('#')}>
            #
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};
