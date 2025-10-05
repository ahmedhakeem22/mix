
/**
 * PWA Installation Helper
 * This module provides functionality to handle PWA installation prompts
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

// Store the deferred prompt for later use
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Check if the app is already installed
export const isAppInstalled = (): boolean => {
  // Check if in standalone mode or display-mode is standalone
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Initialize PWA installation listeners
export const initPwaInstallListeners = (): void => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    console.log('App can be installed, prompt saved');
  });

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', (e) => {
    console.log('App was successfully installed');
    
    // Clear the prompt after installation
    deferredPrompt = null;
  });
};

// Show the installation prompt
export const showInstallPrompt = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  if (!deferredPrompt) {
    console.log('Installation prompt not available');
    return 'unavailable';
  }

  // Show the installation prompt
  deferredPrompt.prompt();

  // Wait for the user's choice
  const choiceResult = await deferredPrompt.userChoice;

  // Clear the prompt after use
  deferredPrompt = null;

  // Return the outcome
  return choiceResult.outcome;
};

// Export an object with all methods
export const pwaInstall = {
  isAppInstalled,
  initPwaInstallListeners,
  showInstallPrompt,
};

// Initialize listeners on module load
initPwaInstallListeners();

export default pwaInstall;
