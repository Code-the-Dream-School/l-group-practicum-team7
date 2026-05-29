type CheckoutSuccessPageProps = {
  orderId?: string;
  onGoProfile?: () => void;
};

export default function CheckoutPageSuccess({
  orderId,
  onGoProfile,
}: CheckoutSuccessPageProps) {
  const storedPremium = localStorage.getItem('premiumStatus');
  const parsedPremium = storedPremium ? JSON.parse(storedPremium) : null;
  const displayOrderId = orderId || parsedPremium?.orderId;

  return (
    <main className="mobile-page profile-page" aria-label="Checkout success page">
      <section className="compact-page-shell">
        <section className="profile-card profile-form-card">
          <div className="profile-form-content">
            <h2>Payment received</h2>

            <p>
              Your PulseMind PRO demo access is now active.
            </p>

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