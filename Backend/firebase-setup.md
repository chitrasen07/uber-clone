# Firebase Setup Instructions

## 1. Enable Firestore Database

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `uber-a93b6`
3. Go to "Firestore Database" in the left sidebar
4. Click "Create database"
5. Choose "Start in test mode" for development (you can secure it later)
6. Select a location for your database

## 2. Set up Authentication (Optional for Admin SDK)

For production, you should set up a service account:

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Set the environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json`

## 3. Configure Firestore Security Rules

Go to Firestore Database > Rules and set the following rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: These rules allow unrestricted access. Only use for development!**

## 4. Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
JWT_SECRET=your_jwt_secret_here
GOOGLE_MAPS_API=your_google_maps_api_key_here
```

## 5. Test the Connection

Run the test script to verify everything is working:

```bash
node test-firebase.js
```

## 6. Production Security Rules

For production, implement proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Captains can only access their own data
    match /captains/{captainId} {
      allow read, write: if request.auth != null && request.auth.uid == captainId;
    }
    
    // Rides can be accessed by the user or captain involved
    match /rides/{rideId} {
      allow read, write: if request.auth != null && 
        (resource.data.user == request.auth.uid || 
         resource.data.captain == request.auth.uid);
    }
  }
}
```
