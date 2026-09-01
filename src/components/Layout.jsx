import React from 'react';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <main className="content-container">
        <Header />
        {children}
        <footer className="footer-note">
          <span>Powered by</span>
          <img src="/favicon.svg" alt="Mimar Models" className="footer-logo-mark" />
          <span>Mimar Models</span>
        </footer>
      </main>
    </div>
  );
}
