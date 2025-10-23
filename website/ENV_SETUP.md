# Website Environment Setup

## Environment Variables

The website uses environment variables to configure external URLs.

### Setup for Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. The default development URL is already set:
   ```
   VITE_APP_URL=http://localhost:5173
   ```

### Setup for Production

When deploying to Railway or other platforms:

1. Set the `VITE_APP_URL` environment variable in your deployment platform:

   ```
   VITE_APP_URL=https://your-frontend-app.railway.app
   ```

2. Or update `.env.production`:
   ```
   VITE_APP_URL=https://your-frontend-app.railway.app
   ```

## Available Environment Variables

| Variable       | Description                              | Default (Dev)           | Example (Prod)                               |
| -------------- | ---------------------------------------- | ----------------------- | -------------------------------------------- |
| `VITE_APP_URL` | Frontend app URL for "Launch App" button | `http://localhost:5173` | `https://receiptoverse-frontend.railway.app` |

## How It Works

The "Launch App" button in the Header component uses `VITE_APP_URL` to determine where to redirect users:

- In **development**: Points to `http://localhost:5173` (local frontend)
- In **production**: Points to your deployed frontend URL

The link opens in a new tab for better user experience.

## Testing

1. Start the website development server:

   ```bash
   npm run dev
   ```

2. Click "Launch App" - it should open `http://localhost:5173` in a new tab

3. To test with a different URL, update `VITE_APP_URL` in `.env` and restart the dev server
