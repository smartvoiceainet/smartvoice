'use client';

import { useEffect } from 'react';

/**
 * This component improves accessibility by adding visible focus styles
 * that only appear when using keyboard navigation, not when clicking with a mouse.
 * This is important for Step 4 of our optimization plan: accessibility improvements.
 */
export default function FocusRing(): JSX.Element | null {
  useEffect(() => {
    // Add a class to the body when keyboard navigation is used
    function handleFirstTab(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        
        // Remove event listener once keyboard nav has been detected
        window.removeEventListener('keydown', handleFirstTab);
        
        // Add mouse detection to remove the class when mouse is used
        window.addEventListener('mousedown', handleMouseDownOnce);
      }
    }
    
    // Remove the class when clicking with mouse
    function handleMouseDownOnce() {
      document.body.classList.remove('user-is-tabbing');
      
      // Re-add the keyboard listener
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleFirstTab);
    }
    
    // Start listening for keyboard navigation
    window.addEventListener('keydown', handleFirstTab);
    
    // Add the global styles
    const style = document.createElement('style');
    style.innerHTML = `
      .user-is-tabbing a:focus,
      .user-is-tabbing button:focus,
      .user-is-tabbing input:focus,
      .user-is-tabbing select:focus,
      .user-is-tabbing textarea:focus,
      .user-is-tabbing [tabindex]:not([tabindex="-1"]):focus {
        outline: 3px solid #1472ff !important;
        outline-offset: 2px !important;
        border-radius: 3px !important;
        box-shadow: 0 0 0 3px rgba(20, 114, 255, 0.3) !important;
        transition: outline-offset 0.1s ease !important;
        z-index: 9999 !important;
      }
      
      /* Hide focus styles when not using keyboard */
      body:not(.user-is-tabbing) a:focus,
      body:not(.user-is-tabbing) button:focus,
      body:not(.user-is-tabbing) input:focus,
      body:not(.user-is-tabbing) select:focus,
      body:not(.user-is-tabbing) textarea:focus,
      body:not(.user-is-tabbing) [tabindex]:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Skip to main content link */
      .skip-to-content {
        position: absolute;
        top: -100px;
        left: 0;
        background: #1472ff;
        color: white;
        padding: 10px;
        z-index: 10000;
        transition: top 0.3s ease;
      }
      
      .skip-to-content:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
    
    // Add "skip to main content" link for keyboard accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
    
    // Make sure we have a main-content ID somewhere
    const mainContent = document.querySelector('main') || document.querySelector('.main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
    
    return () => {
      // Clean up
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDownOnce);
      document.head.removeChild(style);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);
  
  return null;
}
