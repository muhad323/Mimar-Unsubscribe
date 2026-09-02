import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const REASONS = [
  {
    id: 'frequency',
    title: 'Too many emails',
    desc: 'I receive emails more frequently than I would like.',
  },
  {
    id: 'relevance',
    title: 'Content no longer relevant',
    desc: 'Architectural model updates and studio news are no longer relevant to me.',
  },
  {
    id: 'unsolicited',
    title: 'Never signed up',
    desc: 'I did not subscribe or request to receive this newsletter.',
  },
  {
    id: 'break',
    title: 'Inbox cleanup / Temporary break',
    desc: 'I am decluttering my inbox and pausing newsletter subscriptions.',
  },
  {
    id: 'other',
    title: 'Other reason',
    desc: 'I have other specific feedback to share.',
  },
];

// Helper to extract email parameter from search query or hash
function extractEmailFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  let emailParam =
    searchParams.get('email') ||
    searchParams.get('Email') ||
    searchParams.get('EMAIL') ||
    searchParams.get('e') ||
    searchParams.get('mail') ||
    searchParams.get('to');

  // Also check hash fragment if present (e.g. #email=...)
  if (!emailParam && window.location.hash.includes('email=')) {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    emailParam = hashParams.get('email') || hashParams.get('Email');
  }

  return emailParam ? emailParam.trim().toLowerCase() : '';
}

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const [selectedReason, setSelectedReason] = useState('frequency');
  const [customFeedback, setCustomFeedback] = useState('');

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const foundEmail = extractEmailFromUrl();
    if (foundEmail) {
      setEmail(foundEmail);
    }
  }, []);

  const handleUnsubscribe = async (e) => {
    if (e) e.preventDefault();

    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const matched = REASONS.find((r) => r.id === selectedReason);
    const reason = selectedReason === 'other' && customFeedback.trim()
      ? `${matched ? matched.title : selectedReason}: ${customFeedback.trim()}`
      : (matched ? matched.title : selectedReason);

    try {
      console.log("Sending to Google Script:", import.meta.env.VITE_GOOGLE_SCRIPT_URL);

      const res = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ email: targetEmail, reason })
      });

      const result = await res.text();
      console.log("Google Script Response:", result);

      setEmail(targetEmail);
      setIsLoading(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setErrorMessage(error.message || "Something went wrong while unsubscribing. Please try again.");
    }
  };

  // State 1: Success Confirmation
  if (isSuccess) {
    return (
      <Layout>
        <div className="message-card">
          <div className="success-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="main-title">You have been unsubscribed</h1>
          <p className="sub-title">
            <strong>{email}</strong> has been successfully removed from our newsletter list.
          </p>
        </div>
      </Layout>
    );
  }

  // State 2: Main Unsubscribe Dialogue
  return (
    <Layout>
      <form onSubmit={handleUnsubscribe}>
        <h1 className="main-title" style={{ marginBottom: '1.5rem' }}>
          Do you want to unsubscribe?
        </h1>

        <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
          <label
            htmlFor="manual-email-input"
            style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
            }}
          >
            Enter your email address:
          </label>
          <input
            id="manual-email-input"
            type="email"
            required
            placeholder="e.g. name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            className="custom-input-box"
            style={{
              marginTop: 0,
              padding: '0.75rem 0.875rem',
              fontSize: '0.95rem',
              borderRadius: '6px',
            }}
            autoFocus={!email}
          />
        </div>

        <div className="options-list">
          {REASONS.map((item) => {
            const isSelected = selectedReason === item.id;
            return (
              <div key={item.id}>
                <div
                  className="option-item"
                  onClick={() => setSelectedReason(item.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setSelectedReason(item.id);
                    }
                  }}
                >
                  <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && (
                      <svg className="check-icon" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <div className="option-text-group">
                    <span className="option-label">{item.title}</span>
                    <span className="option-desc">{item.desc}</span>
                  </div>
                </div>

                {item.id === 'other' && isSelected && (
                  <input
                    type="text"
                    placeholder="Please specify (optional)..."
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    className="custom-input-box"
                    maxLength={250}
                    style={{ marginTop: '0.5rem' }}
                    autoFocus
                  />
                )}
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <p className="error-text" style={{ marginBottom: '1rem' }}>
            {errorMessage}
          </p>
        )}

        <div className="actions-group">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <span className="spinner-dark" /> Unsubscribing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}
