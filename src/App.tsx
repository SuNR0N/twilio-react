import React, { FC, useEffect, useState, ChangeEvent } from 'react';
import { AppBar, Tabs, Tab } from '@material-ui/core';

import { TabPanel } from './components';
import { Call, TextMessage, VoiceMessage } from './pages';
import { useFetch } from './hooks';
import { ConfigContext } from './contexts/config-context';

interface Configuration {
  phoneNumber: string;
}

export const App: FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [{ data }, getConfig] = useFetch<Configuration>('/api/config');

  const handleChange = (_: ChangeEvent<{}>, newValue: number) => {
    setCurrentTabIndex(newValue);
  };

  useEffect(() => {
    getConfig();
  }, [getConfig]);

  useEffect(() => {
    if (data) {
      setPhoneNumber(data.phoneNumber);
    }
  }, [data]);

  return (
    <ConfigContext.Provider value={phoneNumber}>
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
    </ConfigContext.Provider>
  );
};
