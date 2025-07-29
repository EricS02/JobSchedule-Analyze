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
    } else {
      // User is not logged in - show instructions to authenticate via web app
      loginSection.classList.remove('hidden');
      loggedInSection.classList.add('hidden');
      
      // Update the login form to show web app authentication instructions
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.innerHTML = `
          <div class="auth-instructions">
            <h3>Authenticate via Web App</h3>
            <p>To use the JobSchedule extension:</p>
            <ol>
              <li>Go to <a href="https://jobschedule.io/dashboard/extension" target="_blank">jobschedule.io/dashboard/extension</a></li>
              <li>Log in to your account</li>
              <li>Click "Generate Token"</li>
              <li>Return here and refresh</li>
            </ol>
            <button id="open-web-app" class="btn-primary">Open Web App</button>
          </div>
        `;
        
        // Add event listener for the button
        document.getElementById('open-web-app').addEventListener('click', function() {
          chrome.tabs.create({ url: 'https://jobschedule.io/dashboard/extension' });
        });
      }
    }
  });
  
  // Handle refresh to check for new tokens
  const refreshButton = document.getElementById('refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      // Reload the popup to check for new tokens
      window.location.reload();
    });
  }
  
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