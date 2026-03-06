# 🎯 Alumnx AI Labs - 2026 Booth Handbook

Welcome Team! This guide will help you run the most exciting booth activation for Alumnx AI Labs.

## 🎡 The System

We are running a **LinkedIn Giveaway**. Attendees scan a QR code, post about Alumnx AI Labs, and join our digital roulette wheel for a chance to win swag every hour.

---

## ⏰ Schedule & Draw Times

_Draws happen every hour on the hour._

- **11:00 AM**: Round 1 (2 Winners)
- **12:00 PM**: Round 2 (2 Winners)
- **01:00 PM**: Round 3 (2 Winners)
- **02:00 PM**: Round 4 (2 Winners)
- **03:00 PM**: Round 5 (2 Winners)
- **04:00 PM**: Round 6 (2 Winners)
- **05:00 PM**: Grand Finale (2 Winners)

---

## 🗣️ Booth Scripts (Hindi/English)

### Gathering the Crowd (5 mins before draw)

**English**: "Attention everyone! We are spinning the prize wheel in 5 minutes! If you haven't entered yet, scan this QR code, post on LinkedIn, and see your name appear on the big screen! 2 lucky winners every hour!"

**Hindi**: "दोस्तो! अगले 5 मिनट में हम Prize Wheel चलाने वाले हैं! अगर आपने अभी तक entry नहीं की है, तो फौरन ये QR scan करें, LinkedIn पर post करें और अपना नाम स्क्रीन पर देखें! हर घंटे 2 खुशकिस्मत विनर्स!"

### During the Draw

**English**: "Alright! We have [Number] entries. Let's see who wins the Alumnx Swag! 3... 2... 1... SPIN!"
**Hindi**: "चलो देखते हैं कौन जीतता है आज का Alumnx Swag! 3... 2... 1... घुमाओ पहिया!"

---

### 🖥️ Technical Setup (42" TV Optimization)

1. **Resolution**: Set the TV/Laptop display to **1080p** or **4K**.
2. **Browser**: Ideally use Chrome or Edge in **Full Screen Mode** (Press `F11` or `Cmd+Shift+F`).
3. **Scaling**: If text looks small, use `Ctrl +` to zoom to **110%** or **120%**. The wheel uses High-DPI scaling, so it will remain crystal clear.
4. **Energy**: Ensure the laptop is plugged into power; 4k canvas rendering can drain battery.
5. **Night Mode**: Turn off "Night Shift" or "Blue Light Filter" on the TV to keep the Alumnx Gold/Blue pops vibrant.

## ⚙️ Technical Guide

1. **The Wheel**: Open `index.html` on the 42" TV. Press **F11** for full screen and click **Presentation Mode**.
2. **Adding Entries**:
   - **Auto**: Names populate automatically from the Google Sheet (via script).
   - **Manual**: If someone is in a hurry, click the ⚙️ icon on the wheel dash and add them manually.
3. **Rolling Eligibility**: IMPORTANT. Even if someone wins, **DO NOT delete them**. They stay on the wheel for the whole day to keep the energy high.

---

## 🛡️ Emergency Fixes

- **No Internet**: Switch to manual entry. Ask to see their LinkedIn post and type their name into the wheel settings.
- **Winner Not Present**: Wait 30 seconds. If they don't show up, announce: "Next draw in 1 hour, stay tuned!" (Or spin again if you want to be generous).

## 🚀 Final Launch Checklist (Do this now)

1. **Connect Form to Sheet**:
   - Open your **Google Form**.
   - Go to the **Responses** tab.
   - Click **Link to Sheets** to create or select your database sheet.
2. **Sheet Setup**:
   - Ensure the sheet name is exactly `Sheet1` (or update it in `google-sync.js`).
   - The first row should have headers: `Timestamp`, `Name`, `Phone`, `LinkedIn Handle`, `Role`, `Program`, `Post URL`.
   - Note: The `Post URL` is where the LinkedIn promotion proof will be stored.
3. **Verify Connection**:
   - Submit a test response in your Google Form.
   - Wait 15 seconds.
   - Verify if your name appears on the `index.html` wheel!
4. **TV Mode**:
   - Move the browser window to the 42" TV.
   - Press **F11** for Full Screen.
   - Click **📺 Presentation** in the bottom left footer.

---

## 🔗 LinkedIn Promotion Tracking (Social Proof)

We track attendees who go above and beyond by posting about Alumnx Labs. These users get the **PROMOTER** badge and priority in the wheel visuals.

### Option 1: Automated (The "Coefficient" Way)

_Best for keeping track of all mentions for post-event follow-up._

1. **In Google Sheets**: Go to Extensions > Coefficient > Launch.
2. **Import Data**: Click **Import from...** and search for **LinkedIn**.
3. **Select "LinkedIn Hashtag Analytics"**:
   - Authorized your LinkedIn account.
   - Enter your target hashtags: `#AlumnxLabs`, `#PyConf2026`.
   - Set the refresh schedule to **Hourly**.
4. **Linking to Wheel**: Copy the URLs from the Coefficient "Posts" sheet into our main `Form Responses` sheet under the `Post URL` column to auto-badge them!

### Option 2: Manual (Booth Speed)

_Best for "Instant" rewards while the attendee is standing at the booth._

1. **Ask the Attendee**: "Did you post using our hashtag?"
2. **Verify**: Ask them to show their phone with the live post.
3. **Add Manual Entry**:
   - Tap the ⚙️ icon in the app dashboard.
   - Enter their Name and Handle.
   - **Crucial**: Paste any text into the **Post URL** field (even just "verified").
   - This will instantly trigger the **PROMOTER** badge glow on the screen!

**Let's show everyone what Alumnx AI Labs is all about! 🚀**
