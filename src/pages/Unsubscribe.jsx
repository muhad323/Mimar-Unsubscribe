import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const FLOW_URL = import.meta.env.VITE_FLOW_URL;

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

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const [selectedReason, setSelectedReason] = useState('frequency');
  const [customFeedback, setCustomFeedback] = useState('');
  const [isInvalidLink, setIsInvalidLink] = useState(false);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');

    if (emailParam && emailParam.trim()) {
      setEmail(emailParam.trim().toLowerCase());
      setIsInvalidLink(false);
    } else {
      setIsInvalidLink(true);
    }
  }, []);

  const handleUnsubscribe = async () => {
    if (!email || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    const matched = REASONS.find((r) => r.id === selectedReason);
    let finalReasonText = matched ? matched.title : selectedReason;

    if (selectedReason === 'other' && customFeedback.trim()) {
      finalReasonText += `: ${customFeedback.trim()}`;
    }

    try {
      if (!FLOW_URL) {
        console.warn('⚠️ VITE_FLOW_URL is not set. Simulating success in development mode.');
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsSuccess(true);
        return;
      }

      const response = await fetch(FLOW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          reason: finalReasonText,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to process your unsubscribe request. Please try again.');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage(
        err.message || 'Something went wrong while unsubscribing. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // State 1: Invalid link (missing email)
  if (isInvalidLink) {
    return (
      <Layout>
        <div className="message-card">
          <h1 className="main-title">Invalid unsubscribe link</h1>
          <p className="sub-title" style={{ marginBottom: '1.5rem' }}>
            No email address was provided in the link. Please make sure you clicked the complete link from your Outlook email.
          </p>
        </div>
      </Layout>
    );
  }

  // State 2: Success Confirmation
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

  // State 3: Main Unsubscribe Dialogue
  return (
    <Layout>
      <h1 className="main-title">Do you want to unsubscribe?</h1>
      <p className="sub-title">
        Please select a reason for unsubscribing <strong>{email}</strong>:
      </p>

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
                  autoFocus
                />
              )}
            </div>
          );
        })}
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="actions-group">
        <button
          type="button"
          onClick={handleUnsubscribe}
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
    </Layout>
  );
}
