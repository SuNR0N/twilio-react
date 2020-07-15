import React, { FC } from 'react';
import { Box } from '@material-ui/core';

interface TabPanelProps {
  index: number;
  value: number;
}

export const TabPanel: FC<TabPanelProps> = ({ children, index, value }) => (
  <div id={`tabpnanel-${index}`} role="tabpanel" hidden={index !== value}>
    {value === index && <Box p={3}>{children}</Box>}
  </div>
);
