/* ==========================================================================
   Modern Auth Website - Client-Side Validation & Interactivity
   Works cleanly across index.html (Login) and signup.html (Sign Up)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize shared features
  initPasswordToggles();

  // Initialize page-specific forms if present in the DOM
  initLoginPage();
  initSignUpPage();
  initForgotPasswordModal();
});

/* ==========================================================================
   1. Helper Functions (Validation, UI Feedback, Local Storage)
   ========================================================================== */

/**
 * Validates whether a string matches a standard email format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Evaluates password strength across 4 criteria.
 * @param {string} password
 * @returns {{ score: number, label: string, color: string, checks: object }}
 */
function evaluatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  let score = Object.values(checks).filter(Boolean).length;

  // Give partial credit for medium length even if fewer character types
  if (password.length >= 6 && score === 0) {
    score = 1;
  }

  const levels = [
    { label: 'Too weak', color: '#ef4444' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];

  const current = levels[score] || levels[0];

  return {
    score,
    label: password.length === 0 ? 'Password strength' : current.label,
    color: current.color,
    checks,
  };
}

/**
 * Displays a validation error on a specific input field.
 * @param {HTMLInputElement} input
 * @param {string} errorId
 * @param {string} message
 */
function setFieldError(input, errorId, message) {
  const formGroup = input.closest('.form-group');
  const errorEl = document.getElementById(errorId);
  if (!formGroup || !errorEl) return;

  formGroup.classList.remove('has-success');
  formGroup.classList.add('has-error');
  errorEl.textContent = message;
}

/**
 * Marks a field as valid and clears any previous error message.
 * @param {HTMLInputElement} input
 * @param {string} errorId
 */
function setFieldSuccess(input, errorId) {
  const formGroup = input.closest('.form-group');
  const errorEl = document.getElementById(errorId);
  if (!formGroup || !errorEl) return;

  formGroup.classList.remove('has-error');
  formGroup.classList.add('has-success');
  errorEl.textContent = '';
}

/**
 * Clears both error and success states on a field.
 * @param {HTMLInputElement} input
 * @param {string} errorId
 */
function clearFieldState(input, errorId) {
  const formGroup = input.closest('.form-group');
  const errorEl = document.getElementById(errorId);
  if (!formGroup || !errorEl) return;

  formGroup.classList.remove('has-error', 'has-success');
  errorEl.textContent = '';
}

/**
 * Shows a styled success or error banner inside a form or modal.
 * @param {string} alertId
 * @param {'success' | 'error'} type
 * @param {string} message
 */
function showAlert(alertId, type, message) {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;

  const successIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>`;

  const errorIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>`;

  alertEl.className = `alert ${type}`;
  alertEl.innerHTML = `${type === 'success' ? successIcon : errorIcon}<span>${message}</span>`;
}

/**
 * Hides an alert banner.
 * @param {string} alertId
 */
function hideAlert(alertId) {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;
  alertEl.className = 'alert hidden';
  alertEl.innerHTML = '';
}

/**
 * Retrieves saved demo users from localStorage.
 * @returns {Array<{ fullName: string, email: string, password: string }>}
 */
function getStoredUsers() {
  try {
    const raw = localStorage.getItem('modernAuthUsers');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a newly registered user to localStorage.
 * @param {{ fullName: string, email: string, password: string }} user
 */
function saveStoredUser(user) {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('modernAuthUsers', JSON.stringify(users));
}

/* ==========================================================================
   2. Show / Hide Password Toggle
   ========================================================================== */

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const eyeIcon = button.querySelector('.icon-eye');
      const eyeOffIcon = button.querySelector('.icon-eye-off');
      const isPassword = input.type === 'password';

      // Switch input type between password and plain text
      input.type = isPassword ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(isPassword));
      button.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );

      // Toggle eye / eye-off icons
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
      }
    });
  });
}

/* ==========================================================================
   3. Login Page Logic (index.html)
   ========================================================================== */

function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('rememberMe');

  // Pre-fill email if "Remember me" was previously checked
  const rememberedEmail = localStorage.getItem('modernAuthRememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberCheckbox.checked = true;
  }

  // Real-time validation while typing
  emailInput.addEventListener('input', () => {
    hideAlert('formAlert');
    if (emailInput.value.trim() === '') {
      clearFieldState(emailInput, 'loginEmailError');
    } else if (isValidEmail(emailInput.value)) {
      setFieldSuccess(emailInput, 'loginEmailError');
    }
  });

  passwordInput.addEventListener('input', () => {
    hideAlert('formAlert');
    if (passwordInput.value.trim() === '') {
      clearFieldState(passwordInput, 'loginPasswordError');
    } else if (passwordInput.value.length >= 6) {
      setFieldSuccess(passwordInput, 'loginPasswordError');
    }
  });

  // Handle Login Form Submission
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideAlert('formAlert');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate Email
    if (!email) {
      setFieldError(emailInput, 'loginEmailError', 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setFieldError(
        emailInput,
        'loginEmailError',
        'Please enter a valid email address.'
      );
      isValid = false;
    } else {
      setFieldSuccess(emailInput, 'loginEmailError');
    }

    // Validate Password
    if (!password) {
      setFieldError(passwordInput, 'loginPasswordError', 'Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setFieldError(
        passwordInput,
        'loginPasswordError',
        'Password must be at least 6 characters long.'
      );
      isValid = false;
    } else {
      setFieldSuccess(passwordInput, 'loginPasswordError');
    }

    if (!isValid) {
      showAlert('formAlert', 'error', 'Please fix the highlighted fields below.');
      return;
    }

    // Check against locally registered accounts if the email exists in storage
    const storedUsers = getStoredUsers();
    const matchingUser = storedUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (matchingUser && matchingUser.password !== password) {
      setFieldError(passwordInput, 'loginPasswordError', 'Incorrect password.');
      showAlert(
        'formAlert',
        'error',
        'Invalid credentials. Please check your password and try again.'
      );
      return;
    }

    // Persist or clear "Remember me" email
    if (rememberCheckbox.checked) {
      localStorage.setItem('modernAuthRememberedEmail', email);
    } else {
      localStorage.removeItem('modernAuthRememberedEmail');
    }

    const displayName = matchingUser ? matchingUser.fullName : email;
    showAlert(
      'formAlert',
      'success',
      `Welcome back, ${displayName}! You have logged in successfully.`
    );

    // Clear password field after successful login
    passwordInput.value = '';
    clearFieldState(passwordInput, 'loginPasswordError');
  });
}

/* ==========================================================================
   4. Sign Up Page Logic (signup.html)
   ========================================================================== */

function initSignUpPage() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const hintLength = document.getElementById('hintLength');
  const hintUpper = document.getElementById('hintUpper');
  const hintNumber = document.getElementById('hintNumber');
  const hintSpecial = document.getElementById('hintSpecial');

  /**
   * Updates the password strength progress bar and requirement pills.
   */
  function updateStrengthUI() {
    const value = passwordInput.value;
    const { score, label, color, checks } = evaluatePasswordStrength(value);

    const widthPercent = value.length === 0 ? 0 : Math.max(score * 25, 15);
    strengthBar.style.width = `${widthPercent}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = label;
    strengthText.style.color = value.length === 0 ? '' : color;

    hintLength.classList.toggle('met', checks.length);
    hintUpper.classList.toggle('met', checks.upper);
    hintNumber.classList.toggle('met', checks.number);
    hintSpecial.classList.toggle('met', checks.special);
  }

  /**
   * Validates whether Password and Confirm Password match.
   */
  function validatePasswordMatch() {
    const pass = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    if (!confirm) {
      clearFieldState(confirmPasswordInput, 'confirmPasswordError');
      return false;
    }

    if (pass !== confirm) {
      setFieldError(
        confirmPasswordInput,
        'confirmPasswordError',
        'Passwords do not match.'
      );
      return false;
    }

    setFieldSuccess(confirmPasswordInput, 'confirmPasswordError');
    return true;
  }

  // Real-time input listeners
  fullNameInput.addEventListener('input', () => {
    hideAlert('formAlert');
    const val = fullNameInput.value.trim();
    if (val === '') {
      clearFieldState(fullNameInput, 'fullNameError');
    } else if (val.length >= 2) {
      setFieldSuccess(fullNameInput, 'fullNameError');
    }
  });

  emailInput.addEventListener('input', () => {
    hideAlert('formAlert');
    const val = emailInput.value.trim();
    if (val === '') {
      clearFieldState(emailInput, 'signupEmailError');
    } else if (isValidEmail(val)) {
      setFieldSuccess(emailInput, 'signupEmailError');
    }
  });

  passwordInput.addEventListener('input', () => {
    hideAlert('formAlert');
    updateStrengthUI();

    const { score } = evaluatePasswordStrength(passwordInput.value);
    if (passwordInput.value === '') {
      clearFieldState(passwordInput, 'signupPasswordError');
    } else if (score >= 3) {
      setFieldSuccess(passwordInput, 'signupPasswordError');
    }

    // Re-check confirm password if user already typed in it
    if (confirmPasswordInput.value !== '') {
      validatePasswordMatch();
    }
  });

  confirmPasswordInput.addEventListener('input', () => {
    hideAlert('formAlert');
    validatePasswordMatch();
  });

  // Handle Sign Up Form Submission
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideAlert('formAlert');

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    // 1. Validate Full Name
    if (!fullName) {
      setFieldError(fullNameInput, 'fullNameError', 'Full name is required.');
      isValid = false;
    } else if (fullName.length < 2) {
      setFieldError(
        fullNameInput,
        'fullNameError',
        'Full name must be at least 2 characters.'
      );
      isValid = false;
    } else {
      setFieldSuccess(fullNameInput, 'fullNameError');
    }

    // 2. Validate Email
    if (!email) {
      setFieldError(emailInput, 'signupEmailError', 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setFieldError(
        emailInput,
        'signupEmailError',
        'Please enter a valid email address.'
      );
      isValid = false;
    } else {
      setFieldSuccess(emailInput, 'signupEmailError');
    }

    // 3. Validate Password Strength
    const strength = evaluatePasswordStrength(password);
    if (!password) {
      setFieldError(
        passwordInput,
        'signupPasswordError',
        'Please create a password.'
      );
      isValid = false;
    } else if (password.length < 8 || strength.score < 2) {
      setFieldError(
        passwordInput,
        'signupPasswordError',
        'Use at least 8 characters with uppercase, numbers, or symbols.'
      );
      isValid = false;
    } else {
      setFieldSuccess(passwordInput, 'signupPasswordError');
    }

    // 4. Validate Confirm Password
    if (!confirmPassword) {
      setFieldError(
        confirmPasswordInput,
        'confirmPasswordError',
        'Please confirm your password.'
      );
      isValid = false;
    } else if (password !== confirmPassword) {
      setFieldError(
        confirmPasswordInput,
        'confirmPasswordError',
        'Passwords do not match.'
      );
      isValid = false;
    } else {
      setFieldSuccess(confirmPasswordInput, 'confirmPasswordError');
    }

    if (!isValid) {
      showAlert('formAlert', 'error', 'Please fix the highlighted errors above.');
      return;
    }

    // Prevent duplicate registrations in localStorage
    const storedUsers = getStoredUsers();
    const emailExists = storedUsers.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      setFieldError(
        emailInput,
        'signupEmailError',
        'An account with this email already exists.'
      );
      showAlert(
        'formAlert',
        'error',
        'This email is already registered. Try logging in instead.'
      );
      return;
    }

    // Save the new user and show success message
    saveStoredUser({ fullName, email, password });
    showAlert(
      'formAlert',
      'success',
      `Account created for ${fullName}! Redirecting you to the login page...`
    );

    signupForm.reset();
    updateStrengthUI();
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
      (input) => {
        const formGroup = input.closest('.form-group');
        if (formGroup) formGroup.classList.remove('has-success', 'has-error');
      }
    );

    // Redirect to Login page after a brief pause so the user sees the confirmation
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1800);
  });
}

/* ==========================================================================
   5. Forgot Password Modal Logic (index.html)
   ========================================================================== */

function initForgotPasswordModal() {
  const modal = document.getElementById('forgotModal');
  const openBtn = document.getElementById('forgotPasswordBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const forgotForm = document.getElementById('forgotForm');
  const forgotEmailInput = document.getElementById('forgotEmail');

  if (!modal || !openBtn || !forgotForm) return;

  function openModal() {
    hideAlert('forgotAlert');
    clearFieldState(forgotEmailInput, 'forgotEmailError');

    // Pre-fill from login email if already entered
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail && loginEmail.value.trim()) {
      forgotEmailInput.value = loginEmail.value.trim();
    } else {
      forgotEmailInput.value = '';
    }

    modal.classList.remove('hidden');
    forgotEmailInput.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close when clicking outside the modal card
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  forgotEmailInput.addEventListener('input', () => {
    hideAlert('forgotAlert');
    if (forgotEmailInput.value.trim() === '') {
      clearFieldState(forgotEmailInput, 'forgotEmailError');
    } else if (isValidEmail(forgotEmailInput.value)) {
      setFieldSuccess(forgotEmailInput, 'forgotEmailError');
    }
  });

  forgotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideAlert('forgotAlert');

    const email = forgotEmailInput.value.trim();

    if (!email) {
      setFieldError(
        forgotEmailInput,
        'forgotEmailError',
        'Please enter your email address.'
      );
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError(
        forgotEmailInput,
        'forgotEmailError',
        'Please enter a valid email address.'
      );
      return;
    }

    setFieldSuccess(forgotEmailInput, 'forgotEmailError');
    showAlert(
      'forgotAlert',
      'success',
      `Password reset link sent to ${email}. Please check your inbox.`
    );
  });
}
