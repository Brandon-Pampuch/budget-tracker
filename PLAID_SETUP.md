# Plaid Integration Setup Guide

Your budget app now includes Plaid Link integration! However, Plaid requires a backend server to work properly.

## Current Status

The app includes:
- Plaid Link SDK integration
- UI for connecting bank accounts
- Connection status tracking
- Account disconnect functionality

## What You Need to Complete the Integration

### 1. Sign Up for Plaid

1. Go to https://dashboard.plaid.com/signup
2. Create a free account (Sandbox mode is free)
3. Get your API keys:
   - client_id
   - secret (for sandbox)

### 2. Create a Backend Server

You need a simple backend to:
- Generate link_tokens (required to open Plaid Link)
- Exchange public_tokens for access_tokens
- Fetch transactions from Plaid

**Option A: Simple Node.js Backend**

```javascript
// server.js
const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

// Create link token
app.post('/api/create_link_token', async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id' },
      client_name: 'Budget Tracker',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange public token for access token
app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });
    // Store access_token securely - DO NOT store in frontend!
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const response = await client.transactionsGet({
      access_token: req.body.access_token,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Install dependencies:**
```bash
npm install express plaid cors dotenv
```

**Create .env file:**
```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
```

**Run server:**
```bash
node server.js
```

### 3. Update Frontend to Use Backend

Update `app.js` createLinkToken method:

```javascript
async createLinkToken() {
    try {
        const response = await fetch('http://localhost:3000/api/create_link_token', {
            method: 'POST',
        });
        const data = await response.json();

        const tokenData = {
            token: data.link_token,
            expiration: data.expiration
        };
        localStorage.setItem('plaidLinkToken', JSON.stringify(tokenData));
        return data.link_token;
    } catch (error) {
        console.error('Error creating link token:', error);
        return null;
    }
}
```

Update `handlePlaidSuccess` to exchange token:

```javascript
async handlePlaidSuccess(publicToken, metadata) {
    // Exchange public token with backend
    const response = await fetch('http://localhost:3000/api/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken })
    });

    // Rest of the code...
}
```

## Deployment Options

### Option 1: Serverless (Easiest)
- Deploy backend to Vercel, Netlify Functions, or AWS Lambda
- Update frontend API URLs

### Option 2: Traditional Server
- Deploy to Heroku, Railway, or DigitalOcean
- Use environment variables for secrets

### Option 3: Full Stack Hosting
- Deploy both frontend and backend together on Render or Fly.io

## Security Notes

**IMPORTANT:**
- NEVER store access_tokens in localStorage or frontend
- Always exchange public_tokens on your backend
- Keep your Plaid secret key secure (server-side only)
- Use HTTPS in production
- Implement proper user authentication

## Testing in Sandbox Mode

Plaid Sandbox lets you test with fake credentials:
- Username: `user_good`
- Password: `pass_good`

This will return fake transaction data for testing.

## Current Demo Mode

Right now, the app uses a placeholder token. Clicking "Connect Bank Account" won't actually work until you:
1. Set up a backend server
2. Update the `createLinkToken()` method
3. Deploy your backend

## Next Steps

1. Sign up for Plaid
2. Create a simple backend (see example above)
3. Update frontend API calls
4. Test in Sandbox mode
5. Apply for Production access when ready

## Resources

- Plaid Quickstart: https://plaid.com/docs/quickstart/
- Plaid Dashboard: https://dashboard.plaid.com/
- Plaid API Docs: https://plaid.com/docs/api/
