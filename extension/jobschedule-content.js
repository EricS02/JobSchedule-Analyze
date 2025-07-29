// Content script for JobSchedule pages
console.log("JobSchedule: JobSchedule content script loaded");

// Function to check for extension token in localStorage
function checkForExtensionToken() {
  try {
    const token = localStorage.getItem('extension_token');
    const user = localStorage.getItem('extension_user');
    
    if (token && user) {
      console.log('JobSchedule: Found extension token, sending to background script');
      
      // Send token to extension via chrome.runtime.sendMessage
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'EXTENSION_TOKEN_READY',
          token: token,
          user: JSON.parse(user)
        }, function(response) {
          if (response && response.success) {
            console.log('JobSchedule: Token sent successfully to background script');
          } else {
            console.warn('JobSchedule: Failed to send token to background script');
          }
        });
      } else {
        console.warn('JobSchedule: Chrome runtime not available');
      }
      
      // Clear the token from localStorage
      localStorage.removeItem('extension_token');
      localStorage.removeItem('extension_user');
      
      console.log('JobSchedule: Token cleared from localStorage');
    }
  } catch (error) {
    console.warn('JobSchedule: Error checking for token:', error);
  }
}

// Check for token immediately when script loads
checkForExtensionToken();

// Check periodically for new tokens
setInterval(checkForExtensionToken, 1000);

// Listen for storage events (in case token is set from another tab)
window.addEventListener('storage', (event) => {
  if (event.key === 'extension_token' || event.key === 'extension_user') {
    console.log('JobSchedule: Storage event detected, checking for token');
    checkForExtensionToken();
  }
});

console.log("JobSchedule: JobSchedule content script initialized"); 