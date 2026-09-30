'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface FormState {
  fullName: string;
  email: string;
  merchantName: string;
  monthlyVolume: string;
  message: string;
  website_url_hp: string; // Honeypot
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    email: '',
    merchantName: '',
    monthlyVolume: '₹1Cr - ₹5Cr / mo',
    message: '',
    website_url_hp: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full legal name.';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid business email address.';
    }
    if (!formData.merchantName.trim() || formData.merchantName.trim().length < 2) {
      errs.merchantName = 'Merchant or company name is required.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errs.message = 'Please provide details about your payment setup (min 5 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setServerError(data.error || 'Failed to submit form. Please check your inputs.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setServerError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="shell contact-shell">
        <div className="contact-layout">
          {/* Left Column: Office & Value */}
          <div className="contact-info-col">
            <Link href="/" className="back-link">
              ← Return to Dashboard
            </Link>
            <div className="contact-tag">ENTERPRISE REVENUE ADVISORY</div>
            <h1 className="contact-title">Connect with Our Payment Architects</h1>
            <p className="contact-lead">
              Are payment timeouts, 3DS authentication drops, or gateway latency draining your
              revenue? Let us tailor deterministic recovery policies for your Razorpay stack.
            </p>

            <div className="office-card">
              <h3 className="office-card-title">Registered Corporate Office</h3>
              <p className="office-address">
                <strong>MerchantPulse Technologies Private Limited</strong>
                <br />
                4th Floor, Ballard House, Adi Marzban Path,
                <br />
                Ballard Estate, Fort, Mumbai,
                <br />
                Maharashtra 400001, India.
              </p>
              <div className="office-contacts">
                <div className="contact-row">
                  <span className="contact-icon">✉️</span>
                  <span>contact@merchantpulse.in</span>
                </div>
                <div className="contact-row">
                  <span className="contact-icon">🏛️</span>
                  <span>CIN: U72900MH2025PTC419820</span>
                </div>
                <div className="contact-row">
                  <span className="contact-icon">⏰</span>
                  <span>Response Time: &lt; 4 Hours (Business Days)</span>
                </div>
              </div>
            </div>

            <div className="security-guarantee-box">
              <div className="sec-icon">🛡️</div>
              <div>
                <strong>Zero Spam & Secure Transmission</strong>
                <p>
                  Your details are protected under 256-bit encryption and processed in compliance
                  with India’s DPDP Act 2023. We never distribute contact details to third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="contact-form-col">
            <div className="card form-card">
              {submitted ? (
                <div className="contact-success-state">
                  <div className="success-check-badge">✓</div>
                  <h2>Message Received</h2>
                  <p>
                    Thank you, {formData.fullName}. Your inquiry has been routed to our Mumbai
                    payment engineering team. We will reach out to <strong>{formData.email}</strong> shortly.
                  </p>
                  <Link href="/" className="btn-primary" style={{ marginTop: 20 }}>
                    Return to Revenue Radar
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="contact-form">
                  <h2 className="form-heading">Request Enterprise Demo</h2>
                  <p className="form-subtext">Fill in your details below for a customized audit.</p>

                  {serverError && (
                    <div className="form-alert-error" role="alert">
                      <span>⚠️ {serverError}</span>
                    </div>
                  )}

                  {/* Honeypot field (hidden from screen reader and human sight) */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <label htmlFor="website_url_hp">Leave this empty</label>
                    <input
                      id="website_url_hp"
                      type="text"
                      name="website_url_hp"
                      value={formData.website_url_hp}
                      onChange={(e) => setFormData({ ...formData, website_url_hp: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="fullName" className="field-label">
                      Full Legal Name <span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      className={`field-input ${errors.fullName ? 'has-error' : ''}`}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'name-err' : undefined}
                    />
                    {errors.fullName && (
                      <span id="name-err" className="field-error-msg">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="email" className="field-label">
                      Business Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="vikram@yourbrand.com"
                      className={`field-input ${errors.email ? 'has-error' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-err' : undefined}
                    />
                    {errors.email && (
                      <span id="email-err" className="field-error-msg">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="merchantName" className="field-label">
                      Merchant / Brand Name <span className="req">*</span>
                    </label>
                    <input
                      id="merchantName"
                      type="text"
                      required
                      placeholder="e.g. Metro Lifestyle Co."
                      className={`field-input ${errors.merchantName ? 'has-error' : ''}`}
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                      aria-invalid={Boolean(errors.merchantName)}
                      aria-describedby={errors.merchantName ? 'merchant-err' : undefined}
                    />
                    {errors.merchantName && (
                      <span id="merchant-err" className="field-error-msg">
                        {errors.merchantName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="monthlyVolume" className="field-label">
                      Estimated Monthly Razorpay GMV
                    </label>
                    <select
                      id="monthlyVolume"
                      className="field-input select-input"
                      value={formData.monthlyVolume}
                      onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    >
                      <option value="₹25L - ₹1Cr / mo">₹25 Lakhs – ₹1 Crore / mo</option>
                      <option value="₹1Cr - ₹5Cr / mo">₹1 Crore – ₹5 Crores / mo</option>
                      <option value="₹5Cr - ₹25Cr / mo">₹5 Crores – ₹25 Crores / mo</option>
                      <option value="> ₹25Cr / mo">Over ₹25 Crores / mo (Enterprise Flagship)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="message" className="field-label">
                      Current Payment Challenges & Goals <span className="req">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      placeholder="Tell us about your payment drop-offs, gateway timeout frequency, or recovery workflows..."
                      className={`field-input textarea-input ${errors.message ? 'has-error' : ''}`}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'msg-err' : undefined}
                    />
                    {errors.message && (
                      <span id="msg-err" className="field-error-msg">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary form-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-sm" /> Submitting Request...
                      </>
                    ) : (
                      'Submit Inquiry for Review →'
                    )}
                  </button>

                  <div className="form-disclaimer">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy" className="text-amber">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-amber">
                      Terms
                    </Link>
                    .
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
