'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// This component will only be visible in development mode
// It helps identify accessibility issues in real-time while developing

const A11yChecker = () => {
  const [issues, setIssues] = useState<Array<{id: string, element: string, issue: string, impact: string}>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    setMounted(true);

    const checkAccessibility = () => {
      const newIssues: Array<{id: string, element: string, issue: string, impact: string}> = [];
      
      // Check for images without alt text
      document.querySelectorAll('img').forEach((img, index) => {
        if (!img.hasAttribute('alt')) {
          newIssues.push({
            id: `img-alt-${index}`,
            element: `<img> at ${getElementPath(img)}`,
            issue: 'Image missing alt attribute',
            impact: 'High'
          });
        }
      });
      
      // Check for empty buttons or links (no text or aria-label)
      document.querySelectorAll('button, a').forEach((el, index) => {
        if (el.textContent?.trim() === '' && !el.getAttribute('aria-label')) {
          newIssues.push({
            id: `empty-interactive-${index}`,
            element: `<${el.tagName.toLowerCase()}> at ${getElementPath(el)}`,
            issue: 'Interactive element has no accessible name',
            impact: 'High'
          });
        }
      });
      
      // Check for proper heading hierarchy
      let lastHeadingLevel = 0;
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (lastHeadingLevel === 0 && level !== 1) {
          newIssues.push({
            id: `heading-hierarchy-${index}`,
            element: `<${heading.tagName.toLowerCase()}> at ${getElementPath(heading)}`,
            issue: 'First heading is not an h1',
            impact: 'Medium'
          });
        } else if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
          newIssues.push({
            id: `heading-skip-${index}`,
            element: `<${heading.tagName.toLowerCase()}> at ${getElementPath(heading)}`,
            issue: `Heading level skipped from h${lastHeadingLevel} to h${level}`,
            impact: 'Medium'
          });
        }
        lastHeadingLevel = level;
      });
      
      // Check for form elements without labels
      document.querySelectorAll('input, select, textarea').forEach((formEl, index) => {
        const id = formEl.getAttribute('id');
        if (!id || !document.querySelector(`label[for="${id}"]`)) {
          newIssues.push({
            id: `form-label-${index}`,
            element: `<${formEl.tagName.toLowerCase()}> at ${getElementPath(formEl)}`,
            issue: 'Form element has no associated label',
            impact: 'High'
          });
        }
      });
      
      setIssues(newIssues);
    };

    // Helper function to get element path
    function getElementPath(el: Element): string {
      const path: string[] = [];
      let currentEl: Element | null = el;
      
      while (currentEl && currentEl !== document.body) {
        let selector = currentEl.tagName.toLowerCase();
        
        if (currentEl.id) {
          selector += `#${currentEl.id}`;
        } else if (currentEl.className && typeof currentEl.className === 'string') {
          const classes = currentEl.className.split(' ').filter(Boolean);
          if (classes.length) {
            selector += `.${classes[0]}`;
          }
        }
        
        path.unshift(selector);
        currentEl = currentEl.parentElement;
      }
      
      return path.join(' > ');
    }

    // Run the check on load and when DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(checkAccessibility, 1000);
    });
    
    // Initial check
    setTimeout(checkAccessibility, 1000);
    
    // Watch for DOM changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['alt', 'aria-label'] 
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'development') return null;

  return createPortal(
    <>
      <button
        className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 flex items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle accessibility checker"
      >
        <span className="mr-1">A11y</span>
        <span className="bg-white text-orange-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {issues.length}
        </span>
      </button>
      
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[90vw] max-h-[70vh] bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
          <div className="bg-orange-500 text-white px-4 py-2 flex justify-between items-center">
            <h3 className="font-bold text-lg">Accessibility Issues</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close accessibility checker"
            >
              ✕
            </button>
          </div>
          
          <div className="overflow-auto max-h-[calc(70vh-48px)]">
            {issues.length === 0 ? (
              <div className="p-4 text-center text-green-600">
                <p className="font-medium">No accessibility issues detected!</p>
                <p className="text-sm text-gray-600 mt-1">Keep up the good work!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <li key={issue.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-2">
                      <span 
                        className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                          issue.impact === 'High' ? 'bg-red-500' : 
                          issue.impact === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                      ></span>
                      <div>
                        <p className="font-medium text-gray-800">{issue.issue}</p>
                        <p className="text-xs text-gray-500 mt-1">{issue.element}</p>
                        <p className="text-xs mt-1">
                          <span 
                            className={`px-1.5 py-0.5 rounded ${
                              issue.impact === 'High' ? 'bg-red-100 text-red-800' : 
                              issue.impact === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {issue.impact} Impact
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default A11yChecker;
