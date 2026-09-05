# 🌸 Dearly — Bloom & Brew

Just a pretty app for a pretty you. Show it your insides, and it'll help you see them a little better.

Dearly is a little corner of the internet made for you and your thoughts.

Write about your day. Dump your brain. Talk about something that's been bothering you. Celebrate a tiny win that nobody else would understand.

And when you feel like talking, Dearly's there.

Powered by Gemini, Dearly can read through your reflections, help you make sense of them, summarize what's on your mind, give you something new to think about, or simply have a little conversation with you.

All while keeping your personal journal tucked safely into your own private history.

Because journaling shouldn't feel like homework.

It should feel like sitting down with your favorite drink, opening a fresh page, and finally letting your brain breathe. ☕


A mindful reflection journaling web application with baby pink and latte art coffee-brown aesthetics, powered by the **Gemini 3.6 Flash API**, **Firebase Authentication (Google Sign-In)**, and **Cloud Firestore**. Tagline: *"Bloom & Brew"*.

---

## 🍵 Architecture & Security Overview

- **User Authentication**: Firebase Authentication with Google Sign-In (no passwords stored in application code).
- **Database**: Cloud Firestore with strict user isolation security rules (`/users/{userId}/interactions/{interactionId}`).
- **AI Processing Engine**: Gemini 3.6 Flash API with a resilient model fallback ladder (`gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-flash-latest` -> `gemini-3.7-flash`).
- **Secret Management**: API keys are isolated on the Express backend and injected via Google Cloud Secret Manager / environment variables.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion micro-animations, and warm latte art & sakura themes.

---

## 🚀 Step-by-Step Deployment & Cloud Run Setup

### 1. Prerequisites & Google Cloud Services

Ensure you have the Google Cloud CLI (`gcloud`) installed and authenticated:

```bash
# Log in to Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID="smart-reserve-z1ttq"
export REGION="asia-east1"
gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

### 2. Secret Management Setup (`GEMINI_API_KEY`)

Create the secret in Google Cloud Secret Manager and grant access to the Cloud Run runtime service account:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Retrieve project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 3. Firestore Database Security Configuration

Cloud Firestore utilizes owner-bound path isolation rules. Deploy the security rules defined in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/preferences/{prefId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

To deploy via Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

---

### 4. Cloud Run Deployment Flow

Deploy the full-stack container to Cloud Run, binding the Secret Manager secret to the runtime environment:

```bash
export SERVICE_NAME="latte-blossom-journal"

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

### 5. Required Campaign Labeling (Challenge Verification)

Apply the mandatory resource label to register the service for automated verification:

```bash
gcloud run services update $SERVICE_NAME \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region $REGION
```

---

## 🧪 Comprehensive Walkthrough & Test Suite

Follow these step-by-step test scenarios to verify all processes and user interactions:

### Test Case 1: Landing Page & Micro-Animations
1. **Action**: Open the application URL when unauthenticated.
2. **Expected Result**: The landing page displays the "Latte & Blossom" branding with soft pink and cream gradients, floating sakura petals, and a glowing cursor trail.
3. **Verification**: Moving the cursor reveals the smooth trailing radial glow. Buttons respond with subtle spring scale hover feedback.

### Test Case 2: Federated Google Authentication & Demo Mode
1. **Action**: Click the "Sign in with Google" button.
2. **Expected Result**: A gentle blossom confetti burst triggers, and the Firebase Google Sign-In popup opens.
3. **Verification**: Upon completing authentication, the user is immediately transitioned to their private dashboard with their profile picture and name displayed in the top navbar.
4. **Alternative Demo Flow**: Click "Try Demo Session", enter your custom name in the interactive modal, and click "Enter Journal". The session addresses you by name with local guest persistence. Clicking the "Log out" button beside your name instantly clears the session and returns you to the landing page.

### Test Case 3: Interactive Mindful Breathing Exercise
1. **Action**: On the journal editor, click "Take a Mindful Breath First".
2. **Expected Result**: An animated coffee cup breathing widget expands with a 4-second Inhale -> Hold -> Exhale diaphragmatic pacing loop.

### Test Case 4: Mood Selection & Daily Prompt Insertion
1. **Action**: Click on different mood chips (e.g., "🌸 Serene", "☕ Cozy", "✨ Inspired").
2. **Expected Result**: The active chip highlights with the mood's custom border and pastel accent, and the quote updates dynamically.
3. **Action**: Click "Sparks" in the top bar and select "Use this prompt".
4. **Expected Result**: The modal smoothly closes, and the prompt text is inserted directly into the journal textarea.

### Test Case 5: Journal Submission & Gemini Reflection
1. **Action**: Type a journal entry and click "Send to Gemini".
2. **Expected Result**:
   - The button shows "Brewing Reflection..." with an animated spinning indicator.
   - The backend `/api/chat` endpoint routes the prompt through the model fallback ladder starting with Gemini 3.6 Flash.
   - The response renders with a typewriter-style text reveal.
   - The reflection is saved to Firestore (or local guest session) under `/users/{userId}/interactions/{interactionId}`.

### Test Case 6: Multi-Turn Conversation
1. **Action**: In the reflection view, type a follow-up message into the bottom reply input and submit.
2. **Expected Result**: The message appends to the conversation, Gemini replies empathetically, and the full multi-turn dialogue updates in Cloud Firestore.

### Test Case 7: Empathetic AI Summary Generation
1. **Action**: Click "Generate AI Summary" on the active reflection card.
2. **Expected Result**: The backend `/api/summarize` endpoint processes the reflection and generates a poetic title, 2-sentence empathetic summary, key takeaways, and mood tags.

### Test Case 8: History Vault & Filtering
1. **Action**: Click "History" in the navbar.
2. **Expected Result**: The side-drawer slides in displaying all previously saved entries.
3. **Action**: Type a keyword in the search bar or filter by mood (e.g. "Grateful").
4. **Expected Result**: The list filters instantly. Clicking an entry re-opens the complete multi-turn conversation. Clicking the download icon exports all reflections as formatted Markdown.

### Test Case 9: Instant Aesthetic Palette Transformation
1. **Action**: Click the Palette icon in the navbar (or on the Landing Page) to open "Aesthetic Palette Themes".
2. **Expected Result**: The modal presents 6 curated palettes:
   - **Sakura Latte**: Baby pink milk, warm espresso brown, rosy blush
   - **Kyoto Matcha**: Ceremonial matcha green, oat milk cream, cedar wood
   - **Golden Chai**: Spiced turmeric, warm cinnamon brown, creamy chai
   - **Lavender Milk Tea**: Soothing soft lilac, earl grey tea, amethyst
   - **Midnight Mocha**: Deep roasted dark chocolate, roasted hazelnut, amber glow
   - **Peach Oolong**: Ripe white peach, roasted oolong amber, apricot blossom
3. **Action**: Click on any theme (e.g., "Kyoto Matcha" or "Golden Chai").
4. **Expected Result**: The entire application transforms immediately — CSS variables on `:root` update, changing ambient radial glowing backgrounds, floating canvas petals, navbar, buttons, input fields, badges, charts, and drawer accents simultaneously without reloading. The selection is saved to `localStorage` and user preferences.

### Test Case 10: "How does your heart feel today?" Atmospheric Mood Effects
1. **Action**: In the journal editor under *"How does your heart feel today?"*, click each of the 6 mood buttons:
   - **"Calm & Grounded" (calm)**: Pink sakura petals and 5-petaled flowers gently float and spin down across the entire screen.
   - **"Cozy Latte" (cozy)**: A gentle shower of delicate snowflakes and 6-point ice crystals drift peacefully down from the top.
   - **"Inspired Bloom" (inspired)**: Golden and prismatic sparkles pop, twinkle, and burst across the screen with star glints.
   - **"Tender Rain" (tender)**: Translucent rain streaks fall diagonally across the page for several seconds accompanied by a quick soft flash of thunder across the backdrop.
   - **"Pensive Roast" (pensive/reflective)**: Crisp amber and russet dry autumn leaves shuffle, tumble, and flutter through the air across the screen.
   - **"Heart Blossom" (heart/grateful)**: A magnificent glowing heart pop-up emerges in the center of the screen, beating rhythmically with double pulses and radiating outer bloom halos before gently fading out.
2. **Verification**: Each effect is rendered with non-blocking pointer events, allowing the user to seamlessly type or interact without disruption.
3. **Replay Interaction**: Click the active mood badge in the dashboard header (or in the Conversation View) to replay that mood's atmospheric aesthetic at any time.

---

## 📄 License
Apache-2.0
