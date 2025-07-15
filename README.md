# MyDrinkify

**MyDrinkify** is a mobile application designed to help users track and improve their daily water intake. In today’s busy world, many people forget to drink enough water, which is essential for good health. MyDrinkify provides reminders, progress tracking, and insightful records to help users stay hydrated and build healthy habits.

## 🚀 Features

- **Water Intake Tracking:** Log your water consumption in real-time with simple, intuitive controls.
- **Goal Management:** Set and adjust your daily water intake goals to suit your needs.
- **Progress Visualization:** See your progress with an interactive water bottle display.
- **Performance Records:** View daily, weekly, and monthly hydration history to analyze your habits.
- **Streak System:** Stay motivated by maintaining streaks for consecutive days of meeting your hydration goals.

## 📱 Screenshots

![Landing page](assets/screenshots/screenshots1.jpg)
![Login page](assets/screenshots/screenshots2.jpg)
![Home page](assets/screenshots/screenshots3.jpg)
![Logging water page](assets/screenshots/screenshots4.jpg)
![Progress calendar page](assets/screenshots/screenshots5.jpg)
![Water log page](assets/screenshots/screenshots6.jpg)

---

## 🛠️ Tech Stack

- **React Native** (with Expo)
- **TypeScript**
- **Tailwind CSS** (via NativeWind)
- **Appwrite** (for backend services)

---

## 📝 Getting Started

Follow these steps to set up and run MyDrinkify on your local machine.

### 1. Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (v8 or higher) or **yarn**
- **Expo CLI**  
  Install globally if you don’t have it:
  ```bash
  npm install -g expo-cli
  ```
- **Appwrite** backend (optional, for full functionality)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/MyDrinkify.git
cd MyDrinkify
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Configure Environment

- If you use Appwrite, set up your Appwrite project and update the configuration in `lib/appwrite.js` with your endpoint and project ID.
- (Optional) Add any environment variables or secrets as needed.

### 5. Start the Development Server

```bash
npm start
# or
yarn start
# or
npm expo start
```

- This will launch the Expo developer tools in your browser.
- You can run the app on an Android/iOS emulator or on your physical device using the Expo Go app.

### 6. Running on Device/Emulator

- **Android/iOS Device:**  
  Download the **Expo Go** app from the Play Store or App Store. Scan the QR code from the Expo DevTools in your browser.
- **Emulator:**  
  Make sure you have an Android or iOS emulator set up. Use the options in Expo DevTools to launch the app.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

**Stay hydrated, stay healthy! 💧**
