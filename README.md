# Welcome to RBS GitHub — Modern Login & Sign Up UI

A modern, responsive, and beginner-friendly **Login and Sign Up** web application built with **HTML5**, **CSS3**, and **vanilla JavaScript**. Designed to run seamlessly with the **VS Code Live Server** extension or any local static HTTP server without requiring a backend.

---

## Features

### Login Page (`index.html`)
- **Email & Password Inputs** with crisp inline SVG icons and focus animations.
- **Show / Hide Password Toggle** to switch password visibility with accessible `aria-pressed` states.
- **Remember Me Checkbox** that saves and restores the email address using browser `localStorage`.
- **Forgot Password Modal** allowing users to request a password reset link with email validation and instant status feedback.
- **Client-Side Validation & Alerts** displaying per-field errors and styled top-level success/error banners.
- **Account Verification** against locally registered accounts stored in `localStorage`.

### Sign Up Page (`signup.html`)
- **Full Name, Email, Password & Confirm Password** inputs with real-time validation.
- **Show / Hide Password Toggles** on both Password and Confirm Password fields.
- **Live Password Strength Meter** evaluating length (`8+ chars`), `Uppercase`, `Number`, and `Symbol` requirements with dynamic progress bar colors (`Too weak`, `Weak`, `Fair`, `Good`, `Strong`).
- **Password Match Check** verifying that Password and Confirm Password match before submission.
- **Duplicate Email Prevention** and automatic redirect to `index.html` after successful registration.

### Design & UI (`style.css`)
- **Modern Gradient Background** with animated decorative blur orbs.
- **Clean Card Layout** featuring frosted glass styling, rounded inputs/buttons, and smooth slide-up entrance animations.
- **Responsive Design** adapting cleanly across desktop, tablet, and mobile screens (`@media (max-width: 600px)`).
- **Zero External Icon Dependencies** using inline SVG icons and Google Fonts (`Inter`).

---

## Project Structure

```text
project/
├── index.html    # Login page and Forgot Password modal
├── signup.html   # Sign Up page with password strength indicator
├── style.css     # Responsive layout, theme variables, and animations
├── script.js     # Form validation, password toggles, strength meter, and localStorage logic
└── README.md     # Project documentation
```

---

## Getting Started

### Option 1: VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` and choose **Open with Live Server** (or click **Go Live** in the status bar).

### Option 2: Python Local Server
Run the following command in the project root directory:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Then open [http://127.0.0.1:5500/index.html](http://127.0.0.1:5500/index.html) in your browser.

---

## Technologies Used

- **HTML5** — Semantic structure and accessible form controls (`aria-*`, `role="alert"`, `role="dialog"`).
- **CSS3** — Custom properties (CSS variables), Flexbox, transitions, keyframe animations, and media queries.
- **JavaScript (ES6+)** — DOM manipulation, regex email validation, password strength scoring, and `localStorage` persistence.

---

## Note

This is a front-end authentication UI project. Registered accounts (`modernAuthUsers`) and remembered emails (`modernAuthRememberedEmail`) are stored locally in the browser's `localStorage` for demonstration purposes.
