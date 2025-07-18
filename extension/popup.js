import { API_BASE_URL, USE_TEST_ENDPOINTS } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginSection = document.getElementById('login-section');
  const loggedInSection = document.getElementById('logged-in-section');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const userEmail = document.getElementById('user-email');
  
  // Check if user is logged in
  chrome.storage.local.get(['token', 'user'], function(result) {
    if (result.token && result.user) {
      // User is logged in
      loginSection.classList.add('hidden');
      loggedInSection.classList.remove('hidden');
      userEmail.textContent = result.user.email;
    } else if (USE_TEST_ENDPOINTS) {
      // In development mode, try to get a test token
      fetch(`${API_BASE_URL}/test-token`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.token) {
            // Save token and user info
            chrome.storage.local.set({
              token: data.token,
              user: data.user || { email: 'test@example.com' }
            }, function() {
              // Update UI
              loginSection.classList.add('hidden');
              loggedInSection.classList.remove('hidden');
              userEmail.textContent = data.user?.email || 'test@example.com';
            });
          } else {
            // Show login form
            loginSection.classList.remove('hidden');
            loggedInSection.classList.add('hidden');
          }
        })
        .catch(error => {
          console.error('Error getting test token:', error);
          // Show login form
          loginSection.classList.remove('hidden');
          loggedInSection.classList.add('hidden');
        });
    } else {
      // User is not logged in
      loginSection.classList.remove('hidden');
      loggedInSection.classList.add('hidden');
    }
  });
  
  // Handle login
  loginButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;
    
    // Send login request to your API
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      loginButton.textContent = 'Login';
      loginButton.disabled = false;
      
      if (data.success && data.token) {
        // Save token and user info
        chrome.storage.local.set({
          token: data.token,
          user: data.user
        }, function() {
          // Update UI
          loginSection.classList.add('hidden');
          loggedInSection.classList.remove('hidden');
          userEmail.textContent = data.user.email;
          
          // Clear form
          emailInput.value = '';
          passwordInput.value = '';
          hideError();
        });
      } else {
        showError(data.message || 'Login failed');
      }
    })
    .catch(error => {
      loginButton.textContent = 'Login';
      loginButton.disabled = false;
      showError('Network error. Please try again.');
      console.error('Login error:', error);
    });
  });
  
  // Handle logout
  logoutButton.addEventListener('click', function() {
    chrome.storage.local.remove(['token', 'user'], function() {
      // Update UI
      loginSection.classList.remove('hidden');
      loggedInSection.classList.add('hidden');
    });
  });
  
  // Helper functions
  function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
  
  function hideError() {
    loginError.textContent = '';
    loginError.classList.add('hidden');
  }
}); 