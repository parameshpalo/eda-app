# Google OAuth Setup Guide

## Backend Configuration

1. **Install Dependencies**

   ```bash
   cd "EDA backend"
   pip install -r requirements.txt
   ```

2. **Set Environment Variable**

   - Set `GOOGLE_CLIENT_ID` environment variable with your Google Client ID
   - Or add it to your `.env` file:
     ```
     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     ```

3. **Database Migration**
   - The User model has been updated to support Google OAuth
   - New fields: `provider`, `google_id`, and `password` is now nullable
   - Run your database migration or recreate tables:
     ```python
     # Tables will be created automatically on startup
     # Or run migrations if you have Alembic set up
     ```

## Frontend Configuration

1. **Set Environment Variable**

   - Create a `.env` file in the `EDA frontend` directory
   - Add your Google Client ID:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     ```

2. **Get Google Client ID**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - Your production URL (if applicable)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for local development)
     - Your production URL (if applicable)
   - Copy the Client ID

## How It Works

1. **User clicks "Sign in with Google"**

   - Google Identity Services loads and renders the button
   - User authenticates with Google

2. **Frontend receives Google ID token**

   - Token is sent to `/auth/google` endpoint
   - Backend verifies the token with Google's API

3. **Backend processes authentication**

   - Verifies token validity
   - Extracts user info (email, name, Google ID)
   - Checks if user exists by email or Google ID
   - Creates new user if doesn't exist
   - Updates existing user if needed
   - Returns JWT token

4. **Frontend stores token**
   - JWT token is stored in localStorage
   - User is redirected to dashboard

## Features

- ✅ Automatic user creation for new Google users
- ✅ Links Google account to existing email users
- ✅ Updates user info if changed in Google
- ✅ Secure token verification
- ✅ Matches dashboard theme styling

## Testing

1. Start backend:

   ```bash
   cd "EDA backend"
   uvicorn app.main:app --reload
   ```

2. Start frontend:

   ```bash
   cd "EDA frontend"
   npm run dev
   ```

3. Navigate to login page and click "Sign in with Google"

## Notes

- Make sure both backend and frontend have the same Google Client ID
- The Google Client ID must be configured for the correct domain/origin
- Users can sign in with either email/password or Google OAuth
- Google OAuth users don't have passwords (password field is null)
