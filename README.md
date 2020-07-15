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

Set the _Voice_ webhook for your [configured application](https://www.twilio.com/console/sms/runtime/twiml-apps) based on the _ngrok_ proxy:

```
http://05a4d4643fa0.ngrok.io/hooks/call/connect
```

### Client

```sh
yarn start
```
