import React, { useState } from 'react';

/**
 * Header Component
 * Displays the full official Mimar Models logo.
 */
export default function Header() {
  const [hasError, setHasError] = useState(false);

  return (
    <header className="header">
      <a href="https://mimarmodels.com" target="_blank" rel="noopener noreferrer" className="logo-link" title="Mimar Models">
        {!hasError ? (
          <img
            src="/Mimar Models Logo.png"
            alt="Mimar Models — Reality Miniaturized"
            className="logo full-logo"
            onError={() => setHasError(true)}
          />
        ) : (
          <img
            src="/Mimar Models Logo.png"
            alt="Mimar Models"
            className="logo"
          />
        )}
      </a>
    </header>
  );
}
