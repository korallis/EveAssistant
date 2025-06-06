# Eve Assistant

An advanced fitting and skill planning tool for EVE Online, designed to help capsuleers optimize their ships and character development.

## Features

Eve Assistant provides a suite of powerful tools to help you get the most out of your EVE Online experience:

*   **Fitting Optimizer:** Utilizes a multi-objective genetic algorithm (NSGA-II) to find the best combination of modules for your ship based on your specific goals. You can optimize for a balance of DPS, EHP, capacitor stability, and range.
*   **Advanced Skill Planner:** Creates optimized skill training plans to help you reach your goals faster. It can generate a "Magic 14" plan for new players or create a custom plan to unlock specific ships or modules.
*   **Fitting Recommendations:** Generates five distinct, recommended ship fittings based on different strategic goals like "Max Range," "Close Range Brawl," "Speed Tank," "Max EHP," and "Balanced."
*   **EVE Online Integration:** Connects securely to the EVE Online ESI API to fetch your character's skills, assets, and other data with a simple, one-click login process.
*   **Local Database:** Uses a local SQLite database to store EVE Online's extensive static data (SDE), ensuring fast and offline access to ship attributes, module details, and more.
*   **Cross-Platform:** Built with Electron, the application runs on Windows, macOS, and Linux.

## Getting Started

### Installation

Pre-built installers for Windows and macOS can be found on the [releases page](https://github.com/your-username/your-repo/releases).

### Building from Source

If you prefer to build the application from source, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application in development mode:**
    ```bash
    npm start
    ```

Once the application is running, simply click the "Login with EVE Online" button to authenticate your character.

## Building for Production

To create a distributable package for your operating system:

```bash
npm run make
```

The output will be in the `out/make` directory. The build is configured to create a Squirrel.Windows installer (`.exe`) and a macOS ZIP archive (`.zip`).

---
## Configuration for Developers

### Crash Reporting (Sentry)

This project uses Sentry for crash and error reporting. To enable it, you need to replace the placeholder DSN in `src/main/logger.ts`:

```typescript
// src/main/logger.ts
Sentry.init({
  dsn: 'your-sentry-dsn-goes-here', // <-- Replace this value
  // ...
});
```

## License

This project is licensed under the MIT License. 