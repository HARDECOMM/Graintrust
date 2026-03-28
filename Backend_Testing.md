# GrainTrust AI - API Testing Guide

This guide follows the logical flow of the application, from registration to final payout.

## Base URL
`http://localhost:3000/api`

---

## 1. Authentication (The Start)

### Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Payload**:
```json
{
  "name": "John Farmer",
  "email": "farmer@test.com",
  "password": "password123",
  "role": "farmer"
}
```

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Payload**:
```json
{
  "email": "farmer@test.com",
  "password": "password123"
}
```

---

## 2. The Farmer's Journey (Preparation & Listing)

### Step 1: AI Field Scan (Prediction)
*Farmer scans their field to predict harvest yield. This is handled on the **Frontend** using the Gemini SDK.*
- **Action**: Upload field photo in the Farmer Dashboard.
- **AI Result**: Yield prediction (e.g., 15.5 tons) and confidence score.

### Step 2: AI Grain Visualization (Get Photo)
*Farmer generates a professional image for their listing. This is handled on the **Frontend** using the Gemini SDK.*
- **Action**: Select grain type (e.g., "Premium White Rice") in the listing form.
- **AI Result**: A professional visualization of the grains.

### Step 3: Create Listing
*Farmer officially lists the grain for sale.*
- **URL**: `/api/grains`
- **Method**: `POST`
- **Payload**:
```json
{
  "type": "Rice (Paddy)",
  "quantity": 50,
  "price": 450000,
  "location": "Kano, Nigeria",
  "description": "High-quality harvest.",
  "imageUrl": "AI_GENERATED_IMAGE_URL",
  "yieldPrediction": {
    "tonnage": 15.5,
    "confidence": 0.89,
    "harvestDate": "2026-05-20"
  }
}
```

### Step 4: Manage My Stock
- **Get My Listings**: `GET /grains/my-listings`
- **Update Listing**: `PUT /grains/:id`
- **Delete Listing**: `DELETE /grains/:id`

---

## 3. The Mill's Journey (Buying & Trust)

### Step 1: Browse Marketplace
*Mill finds available grains.*
- **URL**: `/grains`
- **Method**: `GET`

### Step 2: Fund Escrow (Secure the Deal)
*Mill locks the funds in Interswitch Escrow.*
- **URL**: `/escrow/fund/:grainId`
- **Method**: `POST`

### Step 3: AI Quality Scan (Verify Delivery)
*Mill scans the delivered grains to check quality.*
- **URL**: `/escrow/verify/:grainId`
- **Method**: `POST`
- **Payload**: `{ "image": "base64_string" }`

### Step 4: Disburse Funds (Final Payout)
*Mill releases the money to the Farmer.*
- **URL**: `/escrow/disburse/:grainId`
- **Method**: `POST`

---

## 4. Tracking & Alerts

### Get Notifications
- **URL**: `/notifications`
- **Method**: `GET`

### Mark as Read
- **URL**: `/notifications/:id/read`
- **Method**: `PUT`

### My Active Escrows (Mill)
- **URL**: `/escrow/my-escrows`
- **Method**: `GET`
