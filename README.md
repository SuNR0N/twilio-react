# twilio-react

## Environment variable

Set up a `.env.local` file as follows:

```sh
TWILIO_ACCOUNT_SID=Your-Account-SID
TWILIO_APP_SID=Your-Twilio-APP-SID
TWILIO_AUTH_TOKEN=Your-Twilio-Auth-Token
TWILIO_PHONE_NUMBER=Your-Twilio-Phone-Number
```

## Prerequisites

Download and install [ngrok](https://ngrok.com/)

## Install

```sh
yarn
```

## Run

### Server

```sh
# Start server
yarn start:server

# Expose server
ngrok http 1337
```

### Client

```sh
yarn start
```

## Webhooks

Set the _Voice_ webhook for [your configured application](https://www.twilio.com/console/sms/runtime/twiml-apps) based on the _ngrok_ proxy in order to be able to make an outgoing call

```
http://05a4d4643fa0.ngrok.io/hooks/call/connect
```

Set the _Voice_ webhook for [your Twilio phone number](https://www.twilio.com/console/phone-numbers/incoming) based on the _ngrok_ proxy in order to be able to receive an incoming call

```
http://05a4d4643fa0.ngrok.io/hooks/voice
```

## Browser-to-browser & browser-to-device communication

### Participants

- Twilio Media Gateway (TMG)
- Twilio Signaling Server (TSS)
- Client UI #1 (CUI1)
- Client Server #1 (CS1)
- Client UI #2 (CUI2)
- Client Server #2 (CS2)

### Initialisation

#### With valid credentials

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`
2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_
3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ establishes a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`
5. _TSS_ sends a message to _CSU1_ with type `connected` and the location of the gateway
6. _CSU1_ sends a message to _TSS_ with type `register` and its media capabilites (happens periodically)
7. _TSS_ sends a message to _CSU1_ with type `ready`

#### With invalid `TWILIO_ACCOUNT_SID`

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`
2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_
3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ tries to continously establish a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`

#### With invalid `TWILIO_AUTH_TOKEN`

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`
2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_
3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ establishes a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`
5. _TSS_ sends a message to _CUI1_ with type `error` and containing the fact that the JWT signature validation has failed
6. _TSS_ sends a message to _CUI1_ with type `close`

### Ringing a device

1. Start to dial a number from the browser by clicking on the _Call_ button which calls the `connect` function with the number of the callee on the device provided by `twilio-client`
2. _CUI1_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `network-information` and name `network-change`
3. _CUI1_ sends a _POST_ request to _TGW_ with group `get-user-media` and name `succeeded`
4. _CUI1_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `have-local-offer`
5. _CUI1_ sends a message to _TSS_ with type `invite` and with `callsid`, `sdp` and `twilio` number (callee) in its payload
6. _CUI1_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `new`
7. _CUI1_ sends a _POST_ request to _TGW_ with group `ice-gathering-state` and name `gathering`
8. _CUI1_ sends a _POST_ request to _TGW_ with group `ice-candidate` and name `ice-candidate` (can happen multiple times)
9. _CUI1_ sends a _POST_ request to _TGW_ with group `ice-gathering-state` and name `complete`
10. _TSS_ sends a message to _CUI1_ with type `answer` and with `callsid` and `sdp` in its payload
11. _CUI1_ sends a _POST_ request to _TGW_ with group `ice-connection-state` and name `checking`
12. _CUI1_ sends a _POST_ request to _TGW_ with group `settings` and name `edge`
13. _CUI1_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `stable`
14. _CUI1_ sends a _POST_ request to _TGW_ with group `pc-connection-state` and name `connecting`
15. _CUI1_ sends a _POST_ request to _TGW_ with group `connection` and name `accepted-by-remote`
16. _CUI1_ sends a _POST_ request to _TGW_ with group `settings` and name `codec`
17. _CUI1_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `connecting`
18. _CUI1_ sends a _POST_ request to _TGW_ with group `ice-connection-state` and name `connected`
19. _CUI1_ sends a _POST_ request to _TGW_ with group `network-information` and name `network-change`
20. _TGW_ calls the configured `/hooks/call/connect` endpoint within _CS1_
21. _CS1_ responds back with the generated TwiML to _TGW_
22. _CUI1_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `connected`
23. _CUI1_ sends a _POST_ request to _TGW_ with group `pc-connection-state` and name `connected`

#### Hanging up from the browser even before the remote could accept the call

1. Hang up from the browser by clicking the _Decline_ button which calls the `disconnectAll` function of the device provided by `twilio-client`
2. _CUI1_ sends a message to _TSS_ with type `hangup` and with the `callsid` in its payload
3. _CUI1_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `dtls-transport-state` and name `closed`
4. _CUI1_ sends a _POST_ request to _TGW_ with group `connection` and name `disconnected-by-local`
5. _CUI1_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `closed`

#### Accepting the call on the remote device

1. _CUI1_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointMetrics) periodically with group `quality-metrics-sample` and name `metrics-sample`

#### Declining the call on the remote device

1. _TSS_ sends a message to _CUI1_ with type `hangup` and with `callsid` in its payload
2. _CUI1_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `connection` and name `disconnected-by-remote`
3. _CUI1_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `closed`
4. _CUI1_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `closed`

#### With invalid number

1. _TSS_ sends a message to _CUI1_ with type `hangup` and with `callsid` in its payload
2. _CUI1_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `connection` and name `disconnected-by-remote`
3. _CUI1_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `closed`
4. _CUI1_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `closed`

### Receiving a call in the browser

1. _TGW_ calls the configured `/hooks/voice` endpoint within _CS2_
2. _CS2_ responds back with the generated TwiML that contains the client scope which is configured in the JWT token that _CSUI2_ uses
3. _CUI2_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `connection` and name `incoming`

#### Declining the call in the browser

1. By pressing the _Decline_ button on an incoming call calls the `reject` function of the incoming connection object
2. _CUI2_ sends a message to _TSS_ with type `reject` and with the `callsid` in its payload
3. _CUI2_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `connection` and name `rejected-by-local`

#### Accepting the call in the browser

1. _CUI2_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `get-user-media` and name `succeeded`
2. _CUI2_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `have-remote-offer`
3. _CUI2_ sends a _POST_ request to _TGW_ with group `settings` and name `edge`
4. _CUI2_ sends a _POST_ request to _TGW_ with group `network-information` and name `network-change`
5. _CUI2_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `stable`
6. _CUI2_ sends a _POST_ request to _TGW_ with group `connection` and name `accepted-by-local`
7. _TSS_ sends a message to _CUI2_ with type `answer` and with `callsid` and `sdp` in its payload
8. _CUI2_ sends a _POST_ request to _TGW_ with group `settings` and name `codec`
9. _CUI2_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `new`
10. _CUI2_ sends a _POST_ request to _TGW_ with group `ice-connection-state` and name `checking`
11. _CUI2_ sends a _POST_ request to _TGW_ with group `ice-gathering-state` and name `gathering`
12. _CUI2_ sends a _POST_ request to _TGW_ with group `ice-candidate` and name `ice-candidate` (can happen multiple times)
13. _CUI2_ sends a _POST_ request to _TGW_ with group `pc-connection-state` and name `connecting`
14. _CUI2_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `connecting`
15. _CUI2_ sends a _POST_ request to _TGW_ with group `ice-connection-state` and name `connected`
16. _CUI2_ sends a _POST_ request to _TGW_ with group `ice-gathering-state` and name `complete`
17. _CUI2_ sends a _POST_ request to _TGW_ with group `dtls-transport-state` and name `connected`
18. _CUI2_ sends a _POST_ request to _TGW_ with group `pc-connection-state` and name `connected`

#### Declining the call in the browser after accepting

1. _CUI2_ sends a message to _TSS_ with type `hangup` and with `callsid` in its payload
2. _CUI2_ sends a _POST_ request to _TGW_ (https://eventgw.twilio.com/v4/EndpointEvents) with group `dtls-transport-state` and name `closed`
3. _CUI2_ sends a _POST_ request to _TGW_ with group `connection` and name `disconnected-by-local`
4. _CUI2_ sends a _POST_ request to _TGW_ with group `signaling-state` and name `closed`
