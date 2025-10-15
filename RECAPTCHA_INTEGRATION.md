# reCAPTCHA Integration - ReciptoVerse

## Overview

This document outlines the Google reCAPTCHA v2 integration implemented in ReciptoVerse for enhanced security during user registration.

## Configuration

### Frontend Environment Variables

Create or update `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=6LfdyuorAAAAAEitmZgthpS91AtO7XldzLBOByMm
```

### Backend Environment Variables

Create or update `backend/.env`:

```bash
RECAPTCHA_SECRET_KEY=6LfdyuorAAAAAEuyyCt5Z8rBq8mjQfu9yYVXQV64
```

## Implementation Details

### 1. Frontend Components

#### Captcha Component (`frontend/src/components/ui/CaptchaComponent.jsx`)

- React component wrapping Google reCAPTCHA v2
- Automatically loads site key from environment variables
- Provides callback functions for verification, error, and expiration events
- Responsive design with light/dark theme support

#### Registration Integration (`frontend/src/components/AuthModalNew.jsx`)

- Includes reCAPTCHA widget in registration form
- Validates reCAPTCHA token before form submission
- Displays appropriate error messages for failed verification

### 2. Backend Services

#### reCAPTCHA Service (`backend/src/recaptchaService.js`)

- **verifyRecaptcha(token, remoteip)**: Core verification function
- **createRecaptchaMiddleware(options)**: Express middleware for route protection
- **isRecaptchaValid(token)**: Simple boolean verification function

#### Updated Registration Route (`backend/src/userRoutes.js`)

- Validates reCAPTCHA token before processing registration
- Returns specific error codes for failed verification
- Logs verification attempts for monitoring

### 3. User Context Updates (`frontend/src/contexts/UserContext.jsx`)

- Updated `register` function to accept and send reCAPTCHA token
- Maintains backward compatibility with existing authentication flow

## Security Features

### reCAPTCHA v2 Protection

- **Bot Protection**: Prevents automated registration attempts
- **Score-based Filtering**: Can be configured for reCAPTCHA v3 with score thresholds
- **IP Tracking**: Logs verification attempts with client IP addresses
- **Error Handling**: Graceful degradation with informative error messages

### Validation Flow

1. User completes registration form
2. reCAPTCHA widget validates human interaction
3. Frontend receives verification token
4. Token sent to backend with registration data
5. Backend verifies token with Google's API
6. Registration proceeds only if verification succeeds

## Error Codes

### Frontend Error States

- `RECAPTCHA_TOKEN_MISSING`: No reCAPTCHA token provided
- `RECAPTCHA_VERIFICATION_FAILED`: Token verification failed
- `RECAPTCHA_SCORE_TOO_LOW`: Score below minimum threshold (v3)
- `RECAPTCHA_ACTION_NOT_ALLOWED`: Invalid action for reCAPTCHA v3

### Common Error Scenarios

- **Network Issues**: Graceful fallback with retry options
- **Invalid Site Key**: Clear error message for configuration issues
- **Expired Token**: Automatic refresh prompt for users
- **Rate Limiting**: Appropriate handling of Google API limits

## Deployment Considerations

### Railway Deployment

Add environment variables to Railway dashboard:

```bash
RECAPTCHA_SECRET_KEY=6LfdyuorAAAAAEuyyCt5Z8rBq8mjQfu9yYVXQV64
```

### Vercel Deployment

Add environment variables to Vercel dashboard:

```bash
VITE_RECAPTCHA_SITE_KEY=6LfdyuorAAAAAEitmZgthpS91AtO7XldzLBOByMm
```

## Testing Guide

### Local Development

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to registration page
4. Complete reCAPTCHA widget
5. Submit registration form
6. Verify successful registration with reCAPTCHA validation

### Production Testing

1. Deploy with proper environment variables
2. Test registration flow on production domain
3. Monitor backend logs for verification attempts
4. Verify error handling for invalid tokens

## Monitoring & Analytics

### Backend Logging

- reCAPTCHA verification results are logged with timestamps
- Client IP addresses tracked for security monitoring
- Error rates monitored for API health

### Recommended Metrics

- **Verification Success Rate**: Monitor for configuration issues
- **Registration Completion Rate**: Impact on user experience
- **Bot Detection Rate**: Effectiveness of reCAPTCHA protection
- **API Response Times**: Performance monitoring

## Future Enhancements

### reCAPTCHA v3 Migration

- Implement score-based verification
- Add action-specific validation
- Improve user experience with invisible reCAPTCHA

### Additional Security Measures

- Rate limiting on registration endpoints
- Email verification integration
- Multi-factor authentication options
- Device fingerprinting

## Troubleshooting

### Common Issues

1. **reCAPTCHA not loading**: Check site key configuration
2. **Verification always fails**: Verify secret key in backend
3. **CORS errors**: Ensure proper domain configuration in Google Console
4. **High false positive rate**: Consider adjusting score thresholds

### Debug Mode

Enable detailed logging by setting `NODE_ENV=development` in backend environment.

## Support & Documentation

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [React Google reCAPTCHA Library](https://github.com/dozoisch/react-google-recaptcha)
- ReciptoVerse Team: Contact for configuration assistance
