'use client';

import { useEffect } from 'react';

/**
 * PerformanceMonitor is a client component that tracks and reports 
 * Core Web Vitals metrics for performance optimization
 * Part of Step 4: Testing & Optimization
 */
export default function PerformanceMonitor(): JSX.Element | null {
  // Only run in production to avoid development noise
  const isDev = process.env.NODE_ENV === 'development';
  const debugMode = false; // Set to true to see metrics in console even in dev mode

  useEffect(() => {
    // Skip if running in dev mode and debug mode is off
    if (isDev && !debugMode) {
      return;
    }

    // Initialize metrics collection
    let metrics = {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0, // Time to First Byte
      TTI: 0, // Time to Interactive
    };

    // Helper function to send metrics to analytics (mock implementation)
    const sendMetrics = (metricName: string, value: number) => {
      if (debugMode) {
        console.log(`Performance Metric - ${metricName}:`, value);
      }
      
      // In production we would send to analytics service
      if (!isDev) {
        // Placeholder for analytics service
        // Example: window.gtag('event', 'web_vitals', { name: metricName, value });
      }
    };

    // Measure Time To First Byte (TTFB)
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;
      metrics.TTFB = ttfb;
      sendMetrics('TTFB', ttfb);
    }

    // Register FCP observer
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const fcp = entries[0];
        metrics.FCP = fcp.startTime;
        sendMetrics('FCP', fcp.startTime);
      }
    });
    
    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP tracking not supported in this browser');
    }

    // Register LCP observer
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        // Use the most recent LCP entry
        const lcp = entries[entries.length - 1];
        metrics.LCP = lcp.startTime;
        sendMetrics('LCP', lcp.startTime);
      }
    });
    
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP tracking not supported in this browser');
    }

    // Register FID observer
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const fid = entries[0] as PerformanceEventTiming;
        metrics.FID = fid.processingStart - fid.startTime;
        sendMetrics('FID', metrics.FID);
      }
    });
    
    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID tracking not supported in this browser');
    }

    // Register CLS observer
    let clsValue = 0;
    let clsEntries: any[] = [];
    
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach((entry) => {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
          metrics.CLS = clsValue;
          sendMetrics('CLS', clsValue);
        }
      });
    });
    
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS tracking not supported in this browser');
    }

    // Report metrics on page unload
    const reportAllMetrics = () => {
      if (debugMode) {
        console.table(metrics);
      }
      
      // Here we would send a complete report to our analytics service
    };

    window.addEventListener('beforeunload', reportAllMetrics);
    
    // Cleanup function to disconnect observers
    return () => {
      window.removeEventListener('beforeunload', reportAllMetrics);
      
      try {
        fcpObserver.disconnect();
      } catch (e) {}
      
      try {
        lcpObserver.disconnect();
      } catch (e) {}
      
      try { 
        fidObserver.disconnect();
      } catch (e) {}
      
      try {
        clsObserver.disconnect();
      } catch (e) {}
    };
  }, [isDev, debugMode]);

  // This is a tracking component that doesn't render anything
  return null;
}
