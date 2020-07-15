import React, { FC, useState, ChangeEvent } from 'react';
import { AppBar, Tabs, Tab } from '@material-ui/core';

import { TabPanel } from './components';
import { Call, TextMessage, VoiceMessage } from './pages';

export const App: FC = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const handleChange = (_: ChangeEvent<{}>, newValue: number) => {
    setCurrentTabIndex(newValue);
  };

  return (
    <>
      <AppBar position="static">
        <Tabs value={currentTabIndex} onChange={handleChange}>
          <Tab label="Text Message" />
          <Tab label="Voice Message" />
          <Tab label="Call" />
        </Tabs>
      </AppBar>
      <TabPanel value={currentTabIndex} index={0}>
        <TextMessage />
      </TabPanel>
      <TabPanel value={currentTabIndex} index={1}>
        <VoiceMessage />
      </TabPanel>
      <TabPanel value={currentTabIndex} index={2}>
        <Call />
      </TabPanel>
    </>
  );
};
