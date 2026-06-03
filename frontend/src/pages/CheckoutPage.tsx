import React, { useState } from 'react';
import './CheckoutPage.css';
import visaIcon from '../assets/novel/graphics/visa.svg';
import mastercardIcon from '../assets/novel/graphics/mastercard.svg';
import amexIcon from '../assets/novel/graphics/amex.svg';
import discoverIcon from '../assets/novel/graphics/discover.svg';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

type CheckoutPageProps = {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
};

const premiumPlan = {
  id: 'pulsemind_pro_demo',
  name: 'PulseMind PRO',
  priceLabel: '$4.99',
  amountCents: 499,
  currency: 'USD',
};

const paymentCards = [
  {
    name: 'Visa',
    src: visaIcon,
  },
  {
    name: 'Mastercard',
    src: mastercardIcon,
  },
  {
    name: 'American Express',
    src: amexIcon,
  },
  {
    name: 'Discover',
    src: discoverIcon,
  },
];

function detectBrand(cardNumber: string): string {
  if (/^4\d{12,18}$/.test(cardNumber)) return 'visa';
  if (/^(5[1-5]|2[2-7])\d{14}$/.test(cardNumber)) return 'mastercard';
  if (/^3[47]\d{13}$/.test(cardNumber)) return 'amex';
  if (/^6(?:011|5\d{2})\d{12}$/.test(cardNumber)) return 'discover';

  return 'demo-card';
}

export default function CheckoutPage({ onSuccess, onCancel }: CheckoutPageProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const cardNumber = String(formData.get('cardNumber') || '').replace(/\s+/g, '');
    const expMonth = String(formData.get('expMonth') || '');
    const expYear = String(formData.get('expYear') || '');
    const zip = String(formData.get('zip') || '');
    const cvc = String(formData.get('cvc') || '');

    if (cardNumber.length < 12 || !expMonth || !expYear || !zip || !cvc) {
      setMessage('Please fill in all demo payment fields.');
      setLoading(false);
      return;
    }

  const token = localStorage.getItem('token');

  if (!token) {
    setMessage('Please log in before buying premium.');
    setLoading(false);
    return;
  }

  const cardBrand = detectBrand(cardNumber);
  const cardLast4 = cardNumber.slice(-4);
  const shouldFailDemoPayment = cardLast4 === '0002';

  const payload = {
    planId: premiumPlan.id,
    planName: premiumPlan.name,
    amountCents: premiumPlan.amountCents,
    currency: premiumPlan.currency,
    demo: true,
    demoResult: shouldFailDemoPayment ? 'fail' : 'success',
    payment: {
      brand: cardBrand,
      last4: cardLast4,
    },
  };

  try {
    const response = await fetch(`${API}/api/subscription/demo-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || data.message || 'Demo checkout failed. Please try again.'
      );
    }

    if (data.premium !== true || data.status !== 'active' || !data.orderId) {
      throw new Error('Backend did not confirm premium activation.');
    }

    sessionStorage.setItem('lastCheckoutOrderId', data.orderId);

    if (onSuccess) {
      onSuccess(data.orderId);
      return;
    }

    window.dispatchEvent(
      new CustomEvent('checkoutSuccess', {
        detail: { orderId: data.orderId },
      })
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : 'Demo checkout failed. Please try again.'
    );
  } finally {
    setLoading(false);
  }
  }

  return (
    <main className="mobile-page checkout-page" aria-label="Checkout page">
      <section className="checkout-shell">
        <section className="checkout-hero">
          <p className="page-eyebrow">Demo checkout</p>
          <h1>Buy PulseMind PRO</h1>
          <p>
            This is a demo payment page for the learning version of the app.
            No real card payment is processed.
          </p>
        </section>

        {message && <div className="profile-message">{message}</div>}

        <section className="checkout-layout">
          <aside className="checkout-summary-card">
            <h2>Order summary</h2>

            <div className="checkout-plan-row">
              <div>
                <strong>{premiumPlan.name}</strong>
                <p>Premium demo access</p>
              </div>

              <span>{premiumPlan.priceLabel}</span>
            </div>

            <div className="checkout-total-row">
              <span>Total</span>
              <strong>
                {premiumPlan.priceLabel} {premiumPlan.currency}
              </strong>
            </div>

            <p className="checkout-note">
              Demo mode only. Do not enter real banking information.
            </p>
          </aside>

          <section className="checkout-card">
            <div className="checkout-card-header">
              <div>
                <h2>Payment details</h2>
                <p>Accepted demo card types</p>
              </div>

              <div className="checkout-card-icons" aria-label="Accepted card types">
                {paymentCards.map((card) => (
                  <span className="checkout-card-icon" key={card.name}>
                    <img src={card.src} alt={card.name} />
                  </span>
                ))}
              </div>
            </div>

            <form className="checkout-form" onSubmit={onSubmit}>
              <label>
                Demo card number
                <input
                  name="cardNumber"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                />
              </label>

              <div className="checkout-form-grid">
                <label>
                  Expiration month
                  <select name="expMonth" required defaultValue="">
                    <option value="" disabled>
                      Month
                    </option>
                    {Array.from({ length: 12 }, (_, index) => {
                      const month = String(index + 1).padStart(2, '0');

                      return (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label>
                  Expiration year
                  <select name="expYear" required defaultValue="">
                    <option value="" disabled>
                      Year
                    </option>
                    {Array.from({ length: 12 }, (_, index) => {
                      const year = String(new Date().getFullYear() + index);

                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              <div className="checkout-form-grid">
                <label>
                  Billing ZIP code
                  <input
                    name="zip"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="98000"
                  />
                </label>

                <label>
                  Demo security code
                  <input
                    name="cvc"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="123"
                  />
                </label>
              </div>

              <div className="checkout-actions">
                <button type="submit" className="checkout-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Complete demo payment'}
                </button>

                {onCancel && (
                  <button
                    type="button"
                    className="checkout-secondary"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        </section>
      </section>
    </main>
  );
}