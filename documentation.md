# GrainTrust AI - Project Documentation

## 1. Executive Summary
**GrainTrust AI** is a revolutionary agricultural technology platform designed to secure the rice supply chain in Nigeria. It bridges the trust gap between smallholder farmers and rice mills by combining **AI-powered quality verification** with **Secure Escrow Payments** via Interswitch.

---

## 2. The Problem
- **Trust Deficit**: Mills are hesitant to pay farmers upfront due to quality concerns.
- **Quality Disputes**: Manual inspection of rice (moisture, grade) is subjective and prone to error.
- **Payment Delays**: Farmers often wait weeks for payment after delivery.
- **Market Access**: Farmers struggle to find verified buyers at fair prices.

---

## 3. The Solution
GrainTrust AI provides a transparent, automated ecosystem:
1. **AI Field Scan**: Predicts yield and verifies crop health before harvest.
2. **AI Quality Scan**: Uses Computer Vision to grade rice (Moisture, Impurities, Grade) instantly.
3. **Interswitch Escrow**: Secures funds from the mill and releases them to the farmer automatically upon AI-verified quality checks.

---

## 4. System Architecture

### Frontend (Client-Side)
- **Framework**: React 18+ with Vite.
- **Styling**: Tailwind CSS (Modern, Responsive UI).
- **Animations**: Motion (Framer Motion) for smooth transitions.
- **Icons**: Lucide React.
- **State Management**: React Context API (AuthContext).

### Backend (Server-Side)
- **Runtime**: Node.js with Express.
- **Database**: MongoDB (Mongoose ODM) for flexible agricultural data.
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.
- **AI Integration**: Google Gemini API (Multimodal - Image & Text analysis).
- **Payment Integration**: Interswitch API (Simulated for Escrow & Disbursements).

---

## 5. Logical Flow (User Journeys)

### A. The Farmer's Journey
1. **Register/Login**: Create a "Farmer" profile.
2. **AI Field Scan**: Upload a photo of the paddy field. Gemini AI analyzes the crop and predicts yield.
3. **List Harvest**: Create a marketplace listing. AI generates a professional product image based on the variety.
4. **Notification**: Receive an alert when a Mill funds the escrow for their listing.
5. **Quality Verification**: Once the mill scans the delivered rice, the AI verifies the grade.
6. **Payment**: Funds are instantly disbursed to the farmer's bank account via Interswitch.

### B. The Mill Owner's Journey
1. **Register/Login**: Create a "Mill" profile.
2. **Marketplace**: Browse AI-verified listings from farmers.
3. **Fund Escrow**: Secure a listing by paying into the Interswitch Escrow.
4. **AI Quality Scan**: Upon delivery, use the app to scan the rice. AI provides a Grade (A, B, C) and Moisture content.
5. **Release Funds**: If quality matches, trigger the disbursement to the farmer.

---

## 6. Technical Highlights
- **Computer Vision**: Leveraging Gemini's multimodal capabilities to "see" and "grade" agricultural products.
- **Real-time Notifications**: A polling system that keeps both parties updated on escrow status and new listings.
- **Secure Fintech Integration**: Modeled after Interswitch's disbursement and escrow APIs for production readiness.
- **Responsive Design**: Mobile-first approach ensuring farmers can use the app directly in the field.

---

## 7. Future Roadmap
- **IoT Integration**: Smart moisture sensors in silos.
- **Logistics Tracking**: Real-time tracking of rice transport from farm to mill.
- **Credit Scoring**: Using AI yield history to provide farmers with access to micro-loans.
- **Multi-Grain Support**: Expanding beyond rice to maize, wheat, and cocoa.
