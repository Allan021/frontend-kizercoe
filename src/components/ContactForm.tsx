'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitContact } from '@/lib/api';
import { useLang, T, type Lang } from '@/lib/lang';
import type { ContactFormData } from '@/types';

/**
 * Formulario de contacto.
 *
 * Todo lo que se ve cambia de idioma con el botón del nav: el texto suelto con
 * <T> (dos nodos, los pinta el CSS) y lo que va en atributos —placeholders,
 * <option>, mensajes de validación— con useLang().
 *
 * Los `value` de los <select> se quedan en inglés a propósito: es lo que viaja
 * al correo y a la base, y no debe cambiar porque alguien tocó el idioma.
 */

const COPY = {
  en: {
    nameMin: 'Name must be at least 2 characters',
    emailBad: 'Enter a valid email address',
    servicePick: 'Please select a service',
    messageMin: 'Message must be at least 10 characters',
    genericError: 'Something went wrong. Please try again.',
    namePlaceholder: 'Ana García',
    emailPlaceholder: 'ana@company.com',
    companyPlaceholder: 'Acme Inc.',
    servicePlaceholder: 'Select a service...',
    budgetNone: 'Prefer not to say / Not sure',
    budgetUnder: 'Under $5,000',
    budgetRetainer: 'Monthly retainer preferred',
    messagePlaceholder:
      'Describe your current challenge, what you want to build, and any relevant technical details...',
    services: {
      'Web Applications': 'Web Application',
      'Mobile Apps': 'Mobile App',
      'Billing Systems': 'Billing System',
      'Payment Platforms': 'Payment Platform',
      'AI Automation': 'AI Automation',
      'Digital Integrations': 'Digital Integrations',
      'Computer Repair': 'Computer Repair',
      'Security Cameras': 'Security Cameras',
      Other: 'Other / Not sure yet',
    },
  },
  es: {
    nameMin: 'El nombre necesita al menos 2 caracteres',
    emailBad: 'Escribí un correo válido',
    servicePick: 'Elegí un servicio',
    messageMin: 'El mensaje necesita al menos 10 caracteres',
    genericError: 'Algo salió mal. Probá de nuevo.',
    namePlaceholder: 'Ana García',
    emailPlaceholder: 'ana@empresa.com',
    companyPlaceholder: 'Empresa S.A. de C.V.',
    servicePlaceholder: 'Elegí un servicio...',
    budgetNone: 'Prefiero no decir / No sé todavía',
    budgetUnder: 'Menos de $5,000',
    budgetRetainer: 'Prefiero plan mensual',
    messagePlaceholder:
      'Contanos qué problema tenés hoy, qué querés construir y cualquier detalle técnico que sirva...',
    services: {
      'Web Applications': 'Aplicación web',
      'Mobile Apps': 'App móvil',
      'Billing Systems': 'Sistema de facturación',
      'Payment Platforms': 'Plataforma de pagos',
      'AI Automation': 'Automatización con IA',
      'Digital Integrations': 'Integraciones',
      'Computer Repair': 'Reparación de equipo',
      'Security Cameras': 'Cámaras de seguridad',
      Other: 'Otro / Todavía no sé',
    },
  },
} satisfies Record<Lang, Record<string, unknown>>;

const SERVICIOS = Object.keys(COPY.en.services) as (keyof typeof COPY.en.services)[];

const inputClass =
  'w-full px-4 py-3 rounded-xl text-sm font-sans text-[var(--color-text)] placeholder-[var(--color-muted-2)] border border-[var(--color-border)] bg-[var(--color-bg-2)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors duration-200';

const labelClass = 'block text-sm font-semibold text-[var(--color-text)] mb-2';

const errorClass = 'text-[#ff6b6b] text-xs mt-1.5 flex items-center gap-1.5';

const opcional = 'text-[var(--color-muted-2)] font-normal';

function IconoError() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="#ff6b6b" strokeWidth="1.2" />
      <path d="M6 4v3M6 8.5v.5" stroke="#ff6b6b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ContactForm() {
  const lang = useLang();
  const t = COPY[lang];

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  // De qué proyecto vino, si llegó desde una tarjeta del portafolio.
  const [projectSlug, setProjectSlug] = useState<string | null>(null);

  useEffect(() => {
    // El enlace es /#contact?proyecto=slug: el parámetro viaja en el hash, así
    // que no está en location.search sino después del "?" del fragmento.
    const hash = window.location.hash;
    const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search;
    setProjectSlug(new URLSearchParams(query).get('proyecto'));
  }, []);

  // El esquema se rearma al cambiar de idioma: los mensajes viven adentro.
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t.nameMin),
        email: z.string().email(t.emailBad),
        company: z.string().optional(),
        service: z.string().min(1, t.servicePick),
        budget: z.string().optional(),
        message: z.string().min(10, t.messageMin),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
        ...(projectSlug ? { projectSlug } : {}),
      };
      await submitContact(payload);
      setStatus('success');
      reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t.genericError);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(46,91,255,0.12)', border: '2px solid rgba(46,91,255,0.3)' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
              d="M7 18l8 8L29 10"
              stroke="var(--color-accent-strong)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-[var(--color-text)] mb-3">
          <T en="Message received!" es="¡Mensaje recibido!" />
        </h3>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed max-w-[360px] mb-8">
          <T
            en="Thanks for reaching out. We review your request and get back to you within 24 hours."
            es="Gracias por escribirnos. Revisamos tu solicitud y te respondemos dentro de 24 horas."
          />
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-3 rounded-xl text-sm font-bold border border-[var(--color-border)] text-[var(--color-text)] transition-all duration-200 cursor-pointer hover:border-[var(--color-accent)]"
        >
          <T en="Send another message" es="Enviar otro mensaje" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Nombre + correo */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            <T en="Full name" es="Nombre completo" />{' '}
            <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder={t.namePlaceholder}
            autoComplete="name"
            className={inputClass}
            {...register('name')}
          />
          {errors.name && (
            <p className={errorClass} role="alert">
              <IconoError />
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            <T en="Work email" es="Correo de trabajo" />{' '}
            <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            className={inputClass}
            {...register('email')}
          />
          {errors.email && (
            <p className={errorClass} role="alert">
              <IconoError />
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Empresa + servicio */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            <T en="Company name" es="Empresa" />{' '}
            <span className={opcional}>
              <T en="(optional)" es="(opcional)" />
            </span>
          </label>
          <input
            id="company"
            type="text"
            placeholder={t.companyPlaceholder}
            autoComplete="organization"
            className={inputClass}
            {...register('company')}
          />
        </div>
        <div>
          <label htmlFor="service" className={labelClass}>
            <T en="Service needed" es="Servicio que necesitás" />{' '}
            <span className="text-[var(--color-accent)]">*</span>
          </label>
          <select
            id="service"
            className={`${inputClass} appearance-none`}
            {...register('service')}
            defaultValue=""
          >
            <option value="" disabled>
              {t.servicePlaceholder}
            </option>
            {SERVICIOS.map((clave) => (
              <option key={clave} value={clave}>
                {t.services[clave]}
              </option>
            ))}
          </select>
          {errors.service && (
            <p className={errorClass} role="alert">
              <IconoError />
              {errors.service.message}
            </p>
          )}
        </div>
      </div>

      {/* Presupuesto */}
      <div>
        <label htmlFor="budget" className={labelClass}>
          <T en="Estimated budget" es="Presupuesto estimado" />{' '}
          <span className={opcional}>
            <T en="(optional)" es="(opcional)" />
          </span>
        </label>
        <select
          id="budget"
          className={`${inputClass} appearance-none`}
          {...register('budget')}
          defaultValue=""
        >
          <option value="">{t.budgetNone}</option>
          <option value="under-5k">{t.budgetUnder}</option>
          <option value="5k-15k">$5,000 – $15,000</option>
          <option value="15k-50k">$15,000 – $50,000</option>
          <option value="50k-plus">$50,000+</option>
          <option value="retainer">{t.budgetRetainer}</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className={labelClass}>
          <T en="Tell us about your project" es="Contanos de tu proyecto" />{' '}
          <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={t.messagePlaceholder}
          className={`${inputClass} resize-none`}
          {...register('message')}
        />
        {errors.message && (
          <p className={errorClass} role="alert">
            <IconoError />
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Error de la API */}
      {status === 'error' && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(255,107,107,0.08)',
            border: '1px solid rgba(255,107,107,0.2)',
            color: '#ff6b6b',
          }}
          role="alert"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Enviar */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl py-4 text-[15px] font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-strong))',
          boxShadow: '0 4px 24px rgba(91,140,255,0.3)',
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
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M9 2a7 7 0 017 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <T en="Sending..." es="Enviando..." />
          </>
        ) : (
          <>
            <T en="Send message" es="Enviar mensaje" />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 8l12-6-6 12V8H2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.2"
              />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-xs text-[var(--color-muted-2)]">
        <T
          en="We respond within 24 hours. No spam, ever."
          es="Respondemos dentro de 24 horas. Nada de spam."
        />
      </p>
    </form>
  );
}
