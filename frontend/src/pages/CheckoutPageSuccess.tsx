type CheckoutSuccessPageProps = {
  orderId?: string;
  onGoProfile?: () => void;
};

type StoredPremiumStatus = {
  orderId?: string;
  status?: string;
};

function safeParseJson(value: string | null): StoredPremiumStatus | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredPremiumStatus;
  } catch {
    return null;
  }
}

export default function CheckoutPageSuccess({
  orderId,
  onGoProfile,
}: CheckoutSuccessPageProps) {
  const savedPremium = safeParseJson(localStorage.getItem('premiumStatus'));
  const savedOrderId = sessionStorage.getItem('lastCheckoutOrderId');

  const displayOrderId = orderId || savedOrderId || savedPremium?.orderId || '';

  return (
    <main className="mobile-page profile-page" aria-label="Checkout success page">
      <section className="compact-page-shell">
        <section className="profile-card profile-form-card">
          <div className="profile-form-content">
            <h2>Payment received</h2>

            <p>Your PulseMind PRO demo access is now active.</p>

            {displayOrderId && (
              <p>
                Demo order ID: <strong>{displayOrderId}</strong>
              </p>
            )}

            <button
              type="button"
              className="profile-save"
              onClick={() => {
                if (onGoProfile) {
                  onGoProfile();
                  return;
                }

                window.dispatchEvent(new CustomEvent('openProfile'));
              }}
            >
              Back to profile
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}