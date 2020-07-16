import { useEffect, useState } from 'react';
import { Device } from 'twilio-client';

import { useFetch } from './use-fetch';

export const useDevice = (options?: Device.Options): [Device, boolean] => {
  const [isReady, setIsReady] = useState(false);
  const [device] = useState(new Device());
  const [{ data }, generateToken] = useFetch('/api/token/generate', { method: 'POST' });

  useEffect(() => {
    generateToken();
  }, [generateToken]);

  useEffect(() => {
    device.on('ready', () => {
      console.log('[Ready] >>> Twilio.Device is now ready for connections');
      setIsReady(true);
    });
    device.on('error', (error) => {
      console.log('[Error] >>>', error);
    });
  }, [device]);

  useEffect(() => {
    if (data) {
      device.setup(data.token, { ...options });
    }
  }, [data, device, options]);

  return [device, isReady];
};
