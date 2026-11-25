'use client';

import { useEffect, useRef, useState } from 'react';
import { formatLocation, resolveLocation } from '@/lib/locations';
import { placeOrder } from '@/lib/order';
import { useCheckoutStore } from '@/lib/store';
import LocationField from './LocationField';
import { prefersReducedMotion } from './fx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MESSAGES = {
  emptyCart: 'Your bag is empty. Add at least one item before placing an order.',
  missingName: 'Please enter your name so we know who the order is for.',
  badEmail: 'That email address doesn’t look right. Fix it or leave it blank.',
  badLocation:
    'We don’t deliver to that location yet. Pick a city from the list, or leave it blank.',
  failed: 'Something went wrong placing your order. Please try again.',
} as const;

export default function CheckoutForm() {
  const cart = useCheckoutStore((s) => s.cart);
  const name = useCheckoutStore((s) => s.name);
  const email = useCheckoutStore((s) => s.email);
  const setName = useCheckoutStore((s) => s.setName);
  const setEmail = useCheckoutStore((s) => s.setEmail);
  const location = useCheckoutStore((s) => s.location);
  const setLocation = useCheckoutStore((s) => s.setLocation);
  const completeOrder = useCheckoutStore((s) => s.completeOrder);

  const [errors, setErrors] = useState<string[]>([]);
  const [errorNonce, setErrorNonce] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronous lock: React state updates are async, so two clicks in the same
  // frame could both read isSubmitting === false. The ref closes that window.
  const submitLock = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const nameInvalid = errors.includes(MESSAGES.missingName);
  const emailInvalid = errors.includes(MESSAGES.badEmail);
  const locationInvalid = errors.includes(MESSAGES.badLocation);

  // Move focus to the alert each time validation fails so screen readers announce it.
  useEffect(() => {
    if (errorNonce === 0) return;
    alertRef.current?.focus();
    if (!prefersReducedMotion() && nameInvalid) {
      nameRef.current?.animate?.(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(9px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 420, easing: 'ease-out' },
      );
    }
  }, [errorNonce, nameInvalid]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitLock.current) return;

    const found: string[] = [];
    if (cart.length === 0) found.push(MESSAGES.emptyCart);
    if (name.trim() === '') found.push(MESSAGES.missingName);
    if (email.trim() !== '' && !EMAIL_PATTERN.test(email.trim())) found.push(MESSAGES.badEmail);
    const resolved = resolveLocation(location);
    if (location.trim() !== '' && !resolved) found.push(MESSAGES.badLocation);

    if (found.length > 0) {
      setErrors(found);
      setErrorNonce((n) => n + 1);
      return; // cart and typed input are untouched
    }

    submitLock.current = true;
    setIsSubmitting(true);
    setErrors([]);
    try {
      const order = await placeOrder(cart, name, email, resolved ? formatLocation(resolved) : '');
      completeOrder(order);
    } catch {
      setErrors([MESSAGES.failed]);
      setErrorNonce((n) => n + 1);
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel form" aria-labelledby="details-title">
      <h2 className="section-title" id="details-title">
        <span className="section-title__diamond" aria-hidden="true" />
        Your details
      </h2>
      <form
        noValidate
        onSubmit={onSubmit}
        aria-describedby={errors.length ? 'form-errors' : undefined}
      >
        {errors.length > 0 && (
          <div
            key={errorNonce}
            ref={alertRef}
            id="form-errors"
            className="alert"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            data-testid="form-alert"
          >
            {errors.length === 1 ? (
              errors[0]
            ) : (
              <>
                Hold up, fix these first:
                <ul>
                  {errors.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="form__field">
          <label className="form__label" htmlFor="customer-name">
            Name <span className="form__req">*</span>
          </label>
          <input
            ref={nameRef}
            id="customer-name"
            className="form__input"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={nameInvalid || undefined}
            aria-describedby={nameInvalid ? 'form-errors' : undefined}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya S."
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="customer-email">
            Email <span style={{ fontWeight: 500, textTransform: 'none' }}>(optional)</span>
          </label>
          <input
            id="customer-email"
            className="form__input"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? 'form-errors' : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.in"
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="customer-location">
            Delivery city <span style={{ fontWeight: 500, textTransform: 'none' }}>(optional)</span>
          </label>
          <LocationField
            value={location}
            onChange={setLocation}
            invalid={locationInvalid}
            describedBy={locationInvalid ? 'form-errors' : undefined}
          />
        </div>

        <button
          type="submit"
          className="btn btn--huge btn--block"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="btn__spinner" aria-hidden="true">
                ✺
              </span>
              Placing your order…
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </form>
    </section>
  );
}
