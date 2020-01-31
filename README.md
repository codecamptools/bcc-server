# codecamp
API Project for code camp web site [bcc-site](https://github.com/codecamptools/bcc-client)

## Project setup
```
npm run setup
```

### Compiles and runs api for development
```
npm run dev
```

## Environment

Create a local `.env` file with the following entries

```
PORT=5000

AUTH_DOMAIN=bcc-auth.auth0.com
AUTH_AUDIENCE=https://bcc-server
AUTH_CLIENT_ID=[GET_AUTH0_CLIENT_ID]

AZURE_STORAGE_NAME=bccsponsorsite
AZURE_STORAGE_KEY=[GET_REAL_AZURE_STORAGE_KEY_HERE]

PAYPAL_CLIENT=[GET_PAYPAY_CLIENT_ID]
PAYPAL_SECRET=[GET_PAYPAL_SECRECT]
PAYPAL_ENV=sandbox 

```
Change `PAYPAL_ENV` to 'Prod' or remove the value to use the live version of PayPal. Also, use the correct PayPal credentials for sandbox or producton as required

