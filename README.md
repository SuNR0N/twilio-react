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

- Caller: +44 7381 234567
- Callee: +1 203 123 4567
- Twilio Event Gateway (TEG)
- Twilio Proxy (TP)
- Twilio Signaling Server (TSS)
- Twilio Media Gateway (TMG)
- Client UI #1 (CUI1)
- Client Server #1 (CS1)
- Client UI #2 (CUI2)
- Client Server #2 (CS2)

### Initialisation

#### With valid credentials

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`

```sh
curl 'http://localhost:3000/api/token/generate' \
  -X 'POST' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 0' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*' \
  -H 'Origin: http://localhost:3000' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  --compressed
```

2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w"
}
```

3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ establishes a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`

```sh
curl 'wss://chunderw-vpc-gll.twilio.com/signal' \
  -H 'Pragma: no-cache' \
  -H 'Origin: http://localhost:3000' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Sec-WebSocket-Key: 63wsADdaNveeggg3FxwpUA==' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: Upgrade' \
  -H 'Sec-WebSocket-Version: 13' \
  --compressed
```

```json
{
  "type": "listen",
  "version": "1.5",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w",
    "browserinfo": {
      "p": "browser",
      "v": "1.12.1",
      "browser": {
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        "platform": "Linux x86_64"
      },
      "plugin": "rtc"
    }
  }
}
```

5. _TSS_ sends a message to _CSU1_ with type `connected` and the location of the gateway

```json
{
  "payload": {
    "region": "EU_IRELAND",
    "gateway": "ec2-34-244-67-48.eu-west-1.compute.amazonaws.com"
  },
  "type": "connected",
  "version": ""
}
```

6. _CSU1_ sends a message to _TSS_ with type `register` and its media capabilites (happens periodically)

```json
{
  "type": "register",
  "version": "1.5",
  "payload": {
    "media": {
      "audio": true
    }
  }
}
```

7. _TSS_ sends a message to _CSU1_ with type `ready`

```json
{
  "payload": {},
  "type": "ready",
  "version": ""
}
```

#### With invalid `TWILIO_ACCOUNT_SID`

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`

```sh
curl 'http://localhost:3000/api/token/generate' \
  -X 'POST' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 0' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*' \
  -H 'Origin: http://localhost:3000' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  --compressed
```

2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEX0lOVkFMSUQiLCJleHAiOjE1OTg5MjkwMTEsImlhdCI6MTU5NTMyOTAxMX0.emGVfnWHuyT0V58svACvhdsfzLA-bvPtPNR7yahuRu4"
}
```

3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ tries to continously establish a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`

```sh
curl 'wss://chunderw-vpc-gll.twilio.com/signal' \
  -H 'Pragma: no-cache' \
  -H 'Origin: http://localhost:3000' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Sec-WebSocket-Key: On6sRhpxrN0R2zBhaHMpZw==' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: Upgrade' \
  -H 'Sec-WebSocket-Version: 13' \
  --compressed
```

```json
{
  "type": "listen",
  "version": "1.5",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEX0lOVkFMSUQiLCJleHAiOjE1OTg5MjkwMTEsImlhdCI6MTU5NTMyOTAxMX0.emGVfnWHuyT0V58svACvhdsfzLA-bvPtPNR7yahuRu4",
    "browserinfo": {
      "p": "browser",
      "v": "1.12.1",
      "browser": {
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        "platform": "Linux x86_64"
      },
      "plugin": "rtc"
    }
  }
}
```

#### With invalid `TWILIO_AUTH_TOKEN`

1. _CUI1_ requests a JWT token from _CS1_ through a _POST_ request to `/api/token/generate`

```sh
curl 'http://localhost:3000/api/token/generate' \
  -X 'POST' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 0' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Content-Type: application/json' \
  -H 'Accept: */*' \
  -H 'Origin: http://localhost:3000' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  --compressed
```

2. _CS1_ generates a JWT token where the issuer is the `TWILIO_ACCOUNT_SID`, signs it with the `TWILIO_AUTH_TOKEN` and sends it back to _CUI1_

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w"
}
```

3. _CUI1_ sets up the device (browser) with the provided JWT token
4. _CUI1_ establishes a _WSS_ connection with _TSS_ (wss://chunderw-vpc-gll.twilio.com/signal) using its JWT token and sends a message with type `listen`

```sh
curl 'wss://chunderw-vpc-gll.twilio.com/signal' \
  -H 'Pragma: no-cache' \
  -H 'Origin: http://localhost:3000' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Sec-WebSocket-Key: JvpiGpW7j/0tPyskcQecSg==' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: Upgrade' \
  -H 'Sec-WebSocket-Version: 13' \
  --compressed
```

```json
{
  "type": "listen",
  "version": "1.5",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w",
    "browserinfo": {
      "p": "browser",
      "v": "1.12.1",
      "browser": {
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        "platform": "Linux x86_64"
      },
      "plugin": "rtc"
    }
  }
}
```

5. _TSS_ sends a message to _CUI1_ with type `error` and containing the fact that the JWT signature validation has failed

```json
{
  "payload": {
    "error": {
      "code": 31202,
      "message": "JWT signature validation failed"
    }
  },
  "type": "error",
  "version": ""
}
```

6. _TSS_ sends a message to _CUI1_ with type `close`

```json
{
  "payload": {},
  "type": "close",
  "version": ""
}
```

### Ringing a device

1. Start to dial a number from the browser by clicking on the _Call_ button which calls the `connect` function with the number of the callee on the device provided by `twilio-client`
2. _CUI1_ sends a _POST_ request to _TEG_ with group `network-information` and name `network-change` (can happen multiple times)

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"network-information","name":"network-change","timestamp":"2020-07-21T12:17:38.933Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND","downlink":10,"effective_type":"4g","rtt":0},"publisher_metadata":{}}' \
  --compressed ;
```

3. _CUI1_ sends a _POST_ request to _TEG_ with group `get-user-media` and name `succeeded`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"get-user-media","name":"succeeded","timestamp":"2020-07-21T12:17:38.956Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND","data":{"audioConstraints":true}},"publisher_metadata":{}}' \
  --compressed ;
```

4. _CUI1_ sends a _POST_ request to _TEG_ with group `signaling-state` and name `have-local-offer`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"signaling-state","name":"have-local-offer","timestamp":"2020-07-21T12:17:38.970Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

5. _CUI1_ sends a message to _TSS_ with type `invite` and with `callsid`, `sdp` and `twilio` number (callee) in its payload

```json
{
  "type": "invite",
  "version": "1.5",
  "payload": {
    "callsid": "TJSdd0d056e-b21e-4521-9212-721e43cc5fe0",
    "sdp": "v=0\r\no=- 877138663648165384 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS njearFEa4mJxApmwu6TsqieOCtaKiz0upJj3\r\nm=audio 9 UDP/TLS/RTP/SAVPF 0 111 103 104 9 8 106 105 13 110 112 113 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:9eqR\r\na=ice-pwd:KNTTpJsXTszz/Go4t/ePlj8i\r\na=ice-options:trickle\r\na=fingerprint:sha-256 9E:8B:E1:43:77:2C:58:7F:D1:43:84:75:95:BA:0F:8D:E2:DD:F8:FD:A6:06:FB:C6:A4:B5:F3:E2:65:44:0D:15\r\na=setup:actpass\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=msid:njearFEa4mJxApmwu6TsqieOCtaKiz0upJj3 f0341208-2200-46b5-93f6-063c3eb417f6\r\na=rtcp-mux\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:110 telephone-event/48000\r\na=rtpmap:112 telephone-event/32000\r\na=rtpmap:113 telephone-event/16000\r\na=rtpmap:126 telephone-event/8000\r\na=ssrc:3608459366 cname:9LJWw0Ly9wFSNDHb\r\na=ssrc:3608459366 msid:njearFEa4mJxApmwu6TsqieOCtaKiz0upJj3 f0341208-2200-46b5-93f6-063c3eb417f6\r\na=ssrc:3608459366 mslabel:njearFEa4mJxApmwu6TsqieOCtaKiz0upJj3\r\na=ssrc:3608459366 label:f0341208-2200-46b5-93f6-063c3eb417f6\r\n",
    "twilio": {
      "params": "phoneNumber=%2B12031234567"
    }
  }
}
```

6. _CUI1_ sends a _POST_ request to _TEG_ with group `dtls-transport-state` and name `new`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"dtls-transport-state","name":"new","timestamp":"2020-07-21T12:17:38.972Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

7. _CUI1_ sends a _POST_ request to _TEG_ with group `ice-gathering-state` and name `gathering`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"ice-gathering-state","name":"gathering","timestamp":"2020-07-21T12:17:38.975Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

8. _CUI1_ sends a _POST_ request to _TEG_ with group `ice-candidate` and name `ice-candidate` (can happen multiple times)

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"ice-candidate","name":"ice-candidate","timestamp":"2020-07-21T12:17:38.977Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND","candidate_type":"host","deleted":false,"ip":"192.168.1.194","is_remote":false,"network-cost":10,"port":43226,"priority":2122260223,"protocol":"udp","transport_id":"0"},"publisher_metadata":{}}' \
  --compressed ;
```

9. _CUI1_ sends a _POST_ request to _TEG_ with group `ice-gathering-state` and name `complete`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"ice-gathering-state","name":"complete","timestamp":"2020-07-21T12:17:39.071Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

10. _TSS_ sends a message to _CUI1_ with type `answer` and with `callsid` and `sdp` in its payload

```json
{
  "payload": {
    "callsid": "CA557a5d46438c324c7e1f9aa15e5f0dbb",
    "sdp": "v=0\r\no=root 1709099785 1709099785 IN IP4 172.18.229.113\r\ns=Twilio Media Gateway\r\nc=IN IP4 52.215.127.211\r\nt=0 0\r\na=group:BUNDLE 0\r\na=ice-lite\r\nm=audio 16626 RTP/SAVPF 111 0 126\r\na=rtpmap:111 opus/48000/2\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:126 telephone-event/8000\r\na=fmtp:126 0-16\r\na=ptime:20\r\na=maxptime:20\r\na=ice-ufrag:45e63bbd58637940164232cb5dbac951\r\na=ice-pwd:6819ab0e4374895e42e73438696f22ac\r\na=candidate:H34d77fd3 1 UDP 2130706431 52.215.127.211 16626 typ host\r\na=end-of-candidates\r\na=connection:new\r\na=setup:active\r\na=fingerprint:sha-256 6D:83:72:CE:7B:76:76:A2:FD:47:0D:DA:02:FF:51:83:C9:E4:34:5D:80:AA:89:4C:4B:F7:75:35:30:00:74:86\r\na=mid:0\r\na=msid:52bbb57e-aac8-4c9c-a178-b6a3fd7126aa 97ffcc1d-aea3-4e41-a330-ab172b326e33\r\na=ssrc:2019513664 msid:52bbb57e-aac8-4c9c-a178-b6a3fd7126aa 97ffcc1d-aea3-4e41-a330-ab172b326e33\r\na=ssrc:2019513664 mslabel:52bbb57e-aac8-4c9c-a178-b6a3fd7126aa\r\na=ssrc:2019513664 label:97ffcc1d-aea3-4e41-a330-ab172b326e33\r\na=rtcp-mux\r\na=ssrc:2019513664 cname:55a073f2-aafd-44a0-9afb-0ea879b49e59\r\na=sendrecv\r\n"
  },
  "type": "answer",
  "version": ""
}
```

11. _CUI1_ sends a _POST_ request to _TEG_ with group `ice-connection-state` and name `checking`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"ice-connection-state","name":"checking","timestamp":"2020-07-21T12:17:39.103Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

12. _CUI1_ sends a _POST_ request to _TEG_ with group `settings` and name `edge`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"settings","name":"edge","timestamp":"2020-07-21T12:17:39.113Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND","edge":"dublin"},"publisher_metadata":{}}' \
  --compressed ;
```

13. _CUI1_ sends a _POST_ request to _TEG_ with group `signaling-state` and name `stable`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"signaling-state","name":"stable","timestamp":"2020-07-21T12:17:39.114Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

14. _CUI1_ sends a _POST_ request to _TEG_ with group `pc-connection-state` and name `connecting`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"pc-connection-state","name":"connecting","timestamp":"2020-07-21T12:17:39.117Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

15. _CUI1_ sends a _POST_ request to _TEG_ with group `connection` and name `accepted-by-remote`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"connection","name":"accepted-by-remote","timestamp":"2020-07-21T12:17:39.121Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

16. _CUI1_ sends a _POST_ request to _TEG_ with group `settings` and name `codec`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"settings","name":"codec","timestamp":"2020-07-21T12:17:39.123Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND","codec_params":"","selected_codec":"PCMU/8000"},"publisher_metadata":{}}' \
  --compressed ;
```

17. _CUI1_ sends a _POST_ request to _TEG_ with group `dtls-transport-state` and name `connecting`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"dtls-transport-state","name":"connecting","timestamp":"2020-07-21T12:17:39.239Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

18. _CUI1_ sends a _POST_ request to _TEG_ with group `ice-connection-state` and name `connected`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"ice-connection-state","name":"connected","timestamp":"2020-07-21T12:17:39.240Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

19. _TP_ calls the configured `/hooks/call/connect` endpoint within _CS1_

```sh
POST /hooks/call/connect HTTP/1.1
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
X-Twilio-Signature: znnA9kYkLrJxFxI6DrNbHTGq3iE=
I-Twilio-Idempotency-Token: 4152ef63-20ec-4178-abff-186942ec31f0
Content-Length: 286
Host: bea49c3ff63c.ngrok.io
Cache-Control: max-age=259200
User-Agent: TwilioProxy/1.1
connection: close
X-Forwarded-For: 54.147.142.191

AccountSid=AC********************************&ApiVersion=2010-04-01&ApplicationSid=AP********************************&CallSid=CA557a5d46438c324c7e1f9aa15e5f0dbb&CallStatus=ringing&Called=&Caller=client%3AAnonymous&Direction=inbound&From=client%3AAnonymous&To=&phoneNumber=%2B12031234567
```

20. _CS1_ responds back with the generated TwiML to _TP_

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="+447381234567">
    <Number>+12031234567</Number>
  </Dial>
</Response>
```

21. _CUI1_ sends a _POST_ request to _TEG_ with group `dtls-transport-state` and name `connected`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"dtls-transport-state","name":"connected","timestamp":"2020-07-21T12:17:39.243Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

22. _CUI1_ sends a _POST_ request to _TEG_ with group `pc-connection-state` and name `connected`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"pc-connection-state","name":"connected","timestamp":"2020-07-21T12:17:39.246Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

#### Hanging up from the browser even before the remote could accept the call

1. Hang up from the browser by clicking the _Decline_ button which calls the `disconnectAll` function of the device provided by `twilio-client`
2. _CUI1_ sends a message to _TSS_ with type `hangup` and with the `callsid` in its payload

```json
{
  "type": "hangup",
  "version": "1.5",
  "payload": {
    "callsid": "CA557a5d46438c324c7e1f9aa15e5f0dbb"
  }
}
```

3. _CUI1_ sends a _POST_ request to _TEG_ with group `dtls-transport-state` and name `closed`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"dtls-transport-state","name":"closed","timestamp":"2020-07-21T12:18:09.295Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","audio_codec":"PCMU","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

4. _CUI1_ sends a _POST_ request to _TEG_ with group `connection` and name `disconnected-by-local`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"connection","name":"disconnected-by-local","timestamp":"2020-07-21T12:18:09.316Z","level":"INFO","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","audio_codec":"PCMU","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

5. _CUI1_ sends a _POST_ request to _TEG_ with group `signaling-state` and name `closed`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointEvents' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"signaling-state","name":"closed","timestamp":"2020-07-21T12:18:09.323Z","level":"DEBUG","payload_type":"application/json","private":false,"payload":{"aggressive_nomination":false,"browser_extension":false,"dscp":true,"ice_restart_enabled":false,"platform":"WebRTC","sdk_version":"1.12.1","call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","temp_call_sid":"TJSdd0d056e-b21e-4521-9212-721e43cc5fe0","audio_codec":"PCMU","direction":"OUTGOING","gateway":"ec2-34-244-67-48.eu-west-1.compute.amazonaws.com","region":"EU_IRELAND"},"publisher_metadata":{}}' \
  --compressed ;
```

#### Accepting the call on the remote device

1. _CUI1_ sends a _POST_ request to _TEG_ periodically with group `quality-metrics-samples` and name `metrics-sample`

```sh
curl 'https://eventgw.twilio.com/v4/EndpointMetrics' \
  -H 'authority: eventgw.twilio.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36' \
  -H 'x-twilio-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlOmNsaWVudDpvdXRnb2luZz9hcHBTaWQ9VFdJTElPX0FQUF9TSUQgc2NvcGU6Y2xpZW50OmluY29taW5nP2NsaWVudE5hbWU9dHdpbGlvLXJlYWN0IiwiaXNzIjoiVFdJTElPX0FDQ09VTlRfU0lEIiwiZXhwIjoxNTk4OTI5MDExLCJpYXQiOjE1OTUzMjkwMTF9.8BW1h9GoOVg06-jareYRRovdlefgERUNGvumTxs2R8w' \
  -H 'accept: */*' \
  -H 'origin: http://localhost:3000' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: http://localhost:3000/' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  --data-binary '{"publisher":"twilio-js-sdk","group":"quality-metrics-samples","name":"metrics-sample","timestamp":"2020-07-21T12:17:49.129Z","level":"INFO","payload_type":"application/json","private":false,"payload":[{"timestamp":"2020-07-21T12:17:40.125Z","total_packets_received":46,"total_packets_lost":0,"total_packets_sent":46,"total_bytes_received":7182,"total_bytes_sent":7360,"packets_received":46,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":7182,"bytes_sent":7360,"audio_codec":"PCMU","audio_level_in":1057,"audio_level_out":2205,"call_volume_input":0,"call_volume_output":0.04534313725490196,"jitter":1,"rtt":15,"mos":null,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:41.125Z","total_packets_received":96,"total_packets_lost":0,"total_packets_sent":96,"total_bytes_received":15182,"total_bytes_sent":15360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":783,"audio_level_out":6904,"call_volume_input":0,"call_volume_output":0.22426470588235295,"jitter":2,"rtt":15,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:42.125Z","total_packets_received":146,"total_packets_lost":0,"total_packets_sent":146,"total_bytes_received":23182,"total_bytes_sent":23360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":626,"audio_level_out":7840,"call_volume_input":0,"call_volume_output":0.20808823529411766,"jitter":0,"rtt":16,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:43.125Z","total_packets_received":196,"total_packets_lost":0,"total_packets_sent":196,"total_bytes_received":31182,"total_bytes_sent":31360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":953,"audio_level_out":4661,"call_volume_input":0,"call_volume_output":0.17598039215686276,"jitter":0,"rtt":16,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:44.125Z","total_packets_received":246,"total_packets_lost":0,"total_packets_sent":246,"total_bytes_received":39182,"total_bytes_sent":39360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":445,"audio_level_out":7387,"call_volume_input":0,"call_volume_output":0.16642156862745097,"jitter":0,"rtt":15,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:45.125Z","total_packets_received":296,"total_packets_lost":0,"total_packets_sent":296,"total_bytes_received":47182,"total_bytes_sent":47360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":575,"audio_level_out":7150,"call_volume_input":0,"call_volume_output":0.17401960784313725,"jitter":0,"rtt":17,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:46.125Z","total_packets_received":345,"total_packets_lost":0,"total_packets_sent":346,"total_bytes_received":55022,"total_bytes_sent":55360,"packets_received":49,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":7840,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":571,"audio_level_out":6447,"call_volume_input":0,"call_volume_output":0.24926470588235294,"jitter":1,"rtt":17,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:47.125Z","total_packets_received":386,"total_packets_lost":0,"total_packets_sent":396,"total_bytes_received":61582,"total_bytes_sent":63360,"packets_received":41,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":6560,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":566,"audio_level_out":9304,"call_volume_input":0,"call_volume_output":0.14215686274509803,"jitter":2,"rtt":17,"mos":4.42,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:48.125Z","total_packets_received":430,"total_packets_lost":0,"total_packets_sent":446,"total_bytes_received":68622,"total_bytes_sent":71360,"packets_received":44,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":7040,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":1535,"audio_level_out":2001,"call_volume_input":0,"call_volume_output":0.04779411764705882,"jitter":2,"rtt":17,"mos":4.42,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"},{"timestamp":"2020-07-21T12:17:49.125Z","total_packets_received":480,"total_packets_lost":0,"total_packets_sent":496,"total_bytes_received":76622,"total_bytes_sent":79360,"packets_received":50,"packets_lost":0,"packets_lost_fraction":0,"bytes_received":8000,"bytes_sent":8000,"audio_codec":"PCMU","audio_level_in":1144,"audio_level_out":706,"call_volume_input":0.06397058823529411,"call_volume_output":0,"jitter":0,"rtt":17,"mos":4.43,"call_sid":"CA557a5d46438c324c7e1f9aa15e5f0dbb","dscp":true,"sdk_version":"1.12.1","direction":"OUTGOING"}],"publisher_metadata":{}}' \
  --compressed ;
```

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

### Signaling the incoming call in the browser

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
