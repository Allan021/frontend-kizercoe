'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitContact } from '@/lib/api';
import type { ContactFormData } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  company: z.string().optional(),
  service: z.string().min(1, 'Please select a service'),
  budget: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  'w-full px-4 py-3 rounded-xl text-sm font-sans text-[#f0f8ff] placeholder-[#4a6a8a] border border-[rgba(0,200,255,0.12)] bg-[#071020] focus:outline-none focus:border-[#00c8ff] focus:ring-1 focus:ring-[#00c8ff] transition-colors duration-200';

const labelClass = 'block text-sm font-semibold text-[#f0f8ff] mb-2';

const errorClass = 'text-[#ff6b6b] text-xs mt-1.5 flex items-center gap-1.5';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const payload: ContactFormData = {
        name: data.name,
        email: data.email,
        company: data.company,
        service: data.service,
        budget: data.budget,
        message: data.message,
      };
      await submitContact(payload);
      setStatus('success');
      reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(0,255,157,0.12)', border: '2px solid rgba(0,255,157,0.3)' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M7 18l8 8L29 10"
              stroke="#00ff9d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-[#f0f8ff] mb-3">Message Received!</h3>
        <p className="text-[#7a9bbf] text-sm leading-relaxed max-w-[360px] mb-8">
          Thanks for reaching out. Our team will review your request and get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-3 rounded-xl text-sm font-bold border border-[rgba(0,200,255,0.2)] text-[#f0f8ff] hover:border-[#00c8ff] hover:bg-[rgba(0,200,255,0.05)] transition-all duration-200 cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Row 1: Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full Name <span className="text-[#00c8ff]">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ana García"
            autoComplete="name"
            className={inputClass}
            {...register('name')}
          />
          {errors.name && (
            <p className={errorClass} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#ff6b6b" strokeWidth="1.2"/>
                <path d="M6 4v3M6 8.5v.5" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Work Email <span className="text-[#00c8ff]">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="ana@company.com"
            autoComplete="email"
            className={inputClass}
            {...register('email')}
          />
          {errors.email && (
            <p className={errorClass} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#ff6b6b" strokeWidth="1.2"/>
                <path d="M6 4v3M6 8.5v.5" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Company + Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="company" className={labelClass}>
            Company Name <span className="text-[#4a6a8a] font-normal">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            placeholder="Empresa S.A. de C.V."
            autoComplete="organization"
            className={inputClass}
            {...register('company')}
          />
        </div>
        <div>
          <label htmlFor="service" className={labelClass}>
            Service Needed <span className="text-[#00c8ff]">*</span>
          </label>
          <select
            id="service"
            className={`${inputClass} appearance-none`}
            {...register('service')}
            defaultValue=""
          >
            <option value="" disabled>Select a service...</option>
            <option value="Web Applications">Web Application</option>
            <option value="Mobile Apps">Mobile App</option>
            <option value="Billing Systems">Billing System</option>
            <option value="Payment Platforms">Payment Platform</option>
            <option value="AI Automation">AI Automation</option>
            <option value="Digital Integrations">Digital Integrations</option>
            <option value="Computer Repair">Computer Repair</option>
            <option value="Security Cameras">Security Cameras</option>
            <option value="Other">Other / Not sure yet</option>
          </select>
          {errors.service && (
            <p className={errorClass} role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#ff6b6b" strokeWidth="1.2"/>
                <path d="M6 4v3M6 8.5v.5" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {errors.service.message}
            </p>
          )}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className={labelClass}>
          Estimated Budget <span className="text-[#4a6a8a] font-normal">(optional)</span>
        </label>
        <select
          id="budget"
          className={`${inputClass} appearance-none`}
          {...register('budget')}
          defaultValue=""
        >
          <option value="">Prefer not to say / Not sure</option>
          <option value="under-5k">Under $5,000</option>
          <option value="5k-15k">$5,000 – $15,000</option>
          <option value="15k-50k">$15,000 – $50,000</option>
          <option value="50k-plus">$50,000+</option>
          <option value="retainer">Monthly retainer preferred</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>
          Tell us about your project <span className="text-[#00c8ff]">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Describe your current challenge, what you want to build, and any relevant technical details..."
          className={`${inputClass} resize-none`}
          {...register('message')}
        />
        {errors.message && (
          <p className={errorClass} role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#ff6b6b" strokeWidth="1.2"/>
              <path d="M6 4v3M6 8.5v.5" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {errors.message.message}
          </p>
        )}
      </div>

      {/* API error */}
      {status === 'error' && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b' }}
          role="alert"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl font-bold text-[15px] text-[#040d18] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #00c8ff, #00ff9d)',
          boxShadow: '0 4px 24px rgba(0,200,255,0.3)',
        }}
      >
        {status === 'loading' ? (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="animate-spin"
            >
              <circle cx="9" cy="9" r="7" stroke="rgba(4,13,24,0.3)" strokeWidth="2"/>
              <path d="M9 2a7 7 0 017 7" stroke="#040d18" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Sending...
          </>
        ) : (
          <>
            Send Message
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l12-6-6 12V8H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-[#4a6a8a] text-xs">
        We respond within 24 hours. No spam, ever.
      </p>
    </form>
  );
}
