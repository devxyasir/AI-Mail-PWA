'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export function SafeHTML({ html, className = '' }: SafeHTMLProps) {
  const [height, setHeight] = useState('400px'); // Better default min height
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!html) return <div className="p-4 text-outline-variant italic">No message content available.</div>;

  // Content for the iframe with a script to measure its own height
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #1b1c1a;
            margin: 0;
            padding: 1rem;
            font-size: 15px;
            overflow-wrap: break-word;
            overflow-x: hidden;
            background-color: transparent;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1rem 0;
          }
          a {
            color: #a73918;
            text-decoration: underline;
          }
          /* Ensure all elements fit */
          * { max-width: 100% !important; box-sizing: border-box !important; }
        </style>
      </head>
      <body>
        <div id="content-wrapper">${html}</div>
        <script>
          function sendHeight() {
            const wrapper = document.getElementById('content-wrapper');
            const height = Math.max(wrapper.scrollHeight, wrapper.offsetHeight, document.body.scrollHeight);
            window.parent.postMessage({ type: 'resize-iframe', height: height }, '*');
          }
          
          window.addEventListener('load', sendHeight);
          
          if (window.ResizeObserver) {
            const ro = new ResizeObserver(sendHeight);
            ro.observe(document.getElementById('content-wrapper'));
          }
          
          // Polling as safety net
          setInterval(sendHeight, 1000);
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize-iframe' && event.data.height > 0) {
        setHeight(`${event.data.height + 60}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title="Email Content"
      className={`w-full border-none transition-all duration-300 ${className}`}
      style={{ height, minHeight: '300px' }}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
    />
  );
}
