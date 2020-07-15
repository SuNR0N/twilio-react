import { useEffect, useState } from 'react';
import { Device } from 'twilio-client';

import { useFetch } from './use-fetch';

export const useDevice = (): [Device, boolean] => {
  const [isReady, setIsReady] = useState(false);
  const [device] = useState(new Device());
  const [{ data }, generateToken] = useFetch('/api/token/generate', { method: 'POST' });

  useEffect(() => {
    generateToken();
  }, []);

  useEffect(() => {
    device.on('ready', () => {
      setIsReady(true);
      console.log('Device Ready');
    });
    device.on('error', (error) => {
      console.log('Error', error);
    });
  }, [device]);

  useEffect(() => {
    if (data) {
      device.setup(data.token);
    }
  }, [data, device]);

  return [device, isReady];
};
