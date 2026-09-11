'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitContact } from '@/lib/api';
import { useLang, T, type Lang } from '@/lib/lang';
import type { ContactFormData } from '@/types';

/**
 * Formulario de contacto del rediseño: nombre, correo, qué necesitás,
 * industria y mensaje. La industria viaja dentro del mensaje: el backend no
 * necesita otro campo para que el correo llegue completo.
 */

const COPY = {
  en: {
    nameMin: 'Name must be at least 2 characters',
    emailBad: 'Enter a valid email address',
    servicePick: 'Please select a service',
    messageMin: 'Message must be at least 10 characters',
    genericError: 'Something went wrong. Please try again.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@email.com',
    messagePlaceholder: 'What you sell, how you work today and what you want to solve',
    services: {
      'Web Applications': 'A website',
      'Site Modernization': 'Modernize my old website',
      'Online Store': 'An online store',
      'Business System': 'A system for my business',
      'Mobile Apps': 'A mobile app',
      'AI Automation': 'AI that answers for me',
      'Computer Repair': 'Fix my computer or phone',
      Other: 'Something else / not sure yet',
    },
  },
  es: {
    nameMin: 'El nombre necesita al menos 2 caracteres',
    emailBad: 'Escribí un correo válido',
    servicePick: 'Elegí qué necesitás',
    messageMin: 'El mensaje necesita al menos 10 caracteres',
    genericError: 'Algo salió mal. Probá de nuevo.',
    namePlaceholder: 'Tu nombre',
    emailPlaceholder: 'vos@correo.com',
    messagePlaceholder: 'Qué vendés, cómo trabajás hoy y qué querés resolver',
    services: {
      'Web Applications': 'Una página web',
      'Site Modernization': 'Modernizar mi sitio viejo',
      'Online Store': 'Una tienda en línea',
      'Business System': 'Un sistema para mi negocio',
      'Mobile Apps': 'Una app móvil',
      'AI Automation': 'Una IA que atienda por vos',
      'Computer Repair': 'Reparar mi compu o teléfono',
      Other: 'Otra cosa / no estoy seguro',
    },
  },
} satisfies Record<Lang, Record<string, unknown>>;

const SERVICIOS = Object.keys(COPY.en.services) as (keyof typeof COPY.en.services)[];

const INDUSTRIAS = [
  ['Farmacia', 'Pharmacy'], ['Ferretería', 'Hardware store'], ['Boutique', 'Boutique'],
  ['Restaurante', 'Restaurant'], ['Prestamista', 'Lender'], ['Clínica', 'Clinic'],
  ['Abogados', 'Law firm'], ['Bienes raíces', 'Real estate'], ['Distribuidora', 'Distributor'],
  ['Taller', 'Workshop'], ['Otra', 'Other'],
] as const;

const inputClass =
  'w-full rounded-[10px] border px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[var(--green)]';
const inputStyle: React.CSSProperties = {
  borderColor: 'var(--line)',
  background: 'var(--bg)',
  color: 'var(--ink)',
};
const labelClass = 'flex flex-col gap-1.5 text-[13px] font-medium';
const labelStyle: React.CSSProperties = { color: 'var(--ink2)' };
const errorClass = 'text-xs mt-1';
const errorStyle: React.CSSProperties = { color: '#d94848' };

export default function ContactForm() {
  const lang = useLang();
  const t = COPY[lang];

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [industria, setIndustria] = useState('');
  // De qué proyecto vino, si llegó desde una tarjeta del portafolio.
  const [projectSlug, setProjectSlug] = useState<string | null>(null);

  useEffect(() => {
    // El parámetro viaja en el hash (#contacto?proyecto=...): se relee en cada
    // hashchange porque navegar dentro de la página no recarga.
    const leer = () => {
      const hash = window.location.hash;
      const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search;
      setProjectSlug(new URLSearchParams(query).get('proyecto'));
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => window.removeEventListener('hashchange', leer);
  }, []);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t.nameMin),
        email: z.string().email(t.emailBad),
        service: z.string().min(1, t.servicePick),
        message: z.string().min(10, t.messageMin),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Venir de una tarjeta de precios (#contacto?servicio=...) deja el servicio
  // ya elegido: el cliente solo escribe su nombre y qué necesita.
  useEffect(() => {
    const leerServicio = () => {
      const hash = window.location.hash;
      const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search;
      const s = new URLSearchParams(query).get('servicio');
      if (s && SERVICIOS.includes(s as (typeof SERVICIOS)[number])) setValue('service', s);
    };
    leerServicio();
    window.addEventListener('hashchange', leerServicio);
    return () => window.removeEventListener('hashchange', leerServicio);
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const payload: ContactFormData = {
        name: data.name,
        email: data.email,
        service: data.service,
        // La industria viaja al frente del mensaje: llega en el mismo correo.
        message: industria ? `Industria: ${industria}\n\n${data.message}` : data.message,
        ...(projectSlug ? { projectSlug } : {}),
      };
      await submitContact(payload);
      // Conversión para Analytics/Ads: un mensaje enviado es un prospecto.
      (window as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'generate_lead', {
        service: data.service,
        ...(projectSlug ? { project: projectSlug } : {}),
      });
      setStatus('success');
      reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t.genericError);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--green-soft)', border: '2px solid var(--green)' }}
        >
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path d="M7 18l8 8L29 10" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
          <T en="Message received!" es="¡Mensaje recibido!" />
        </h3>
        <p className="max-w-[340px] text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>
          <T
            en="Thanks for reaching out. We review your request and get back to you within 24 hours."
            es="Gracias por escribirnos. Revisamos tu solicitud y te respondemos dentro de 24 horas."
          />
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="kz-btn kz-btn-secundario mt-2 text-sm"
          style={{ padding: '10px 20px' }}
        >
          <T en="Send another message" es="Enviar otro mensaje" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {projectSlug && (
        <p
          className="inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)', background: 'var(--green-soft)', color: 'var(--green2)' }}
        >
          <span className="kz-latido" />
          <T en={`about: ${projectSlug}`} es={`sobre: ${projectSlug}`} />
        </p>
      )}

      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <label className={labelClass} style={labelStyle}>
          <T en="Name" es="Nombre" />
          <input type="text" autoComplete="name" placeholder={t.namePlaceholder} className={inputClass} style={inputStyle} {...register('name')} />
          {errors.name && <span className={errorClass} style={errorStyle} role="alert">{errors.name.message}</span>}
        </label>
        <label className={labelClass} style={labelStyle}>
          <T en="Email" es="Correo" />
          <input type="email" autoComplete="email" placeholder={t.emailPlaceholder} className={inputClass} style={inputStyle} {...register('email')} />
          {errors.email && <span className={errorClass} style={errorStyle} role="alert">{errors.email.message}</span>}
        </label>
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <label className={labelClass} style={labelStyle}>
          <T en="What do you need?" es="¿Qué necesitás?" />
          <select className={inputClass} style={inputStyle} defaultValue="" {...register('service')}>
            <option value="" disabled>
              {lang === 'es' ? 'Elegí una opción...' : 'Pick an option...'}
            </option>
            {SERVICIOS.map((clave) => (
              <option key={clave} value={clave}>
                {t.services[clave]}
              </option>
            ))}
          </select>
          {errors.service && <span className={errorClass} style={errorStyle} role="alert">{errors.service.message}</span>}
        </label>
        <label className={labelClass} style={labelStyle}>
          <T en="Industry (optional)" es="Industria (opcional)" />
          <select className={inputClass} style={inputStyle} value={industria} onChange={(e) => setIndustria(e.target.value)}>
            <option value="">{lang === 'es' ? 'Elegí si aplica...' : 'Pick if it applies...'}</option>
            {INDUSTRIAS.map(([es, en]) => (
              <option key={es} value={es}>
                {lang === 'es' ? es : en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass} style={labelStyle}>
        <T en="Tell us about your business" es="Contanos de tu negocio" />
        <textarea rows={4} placeholder={t.messagePlaceholder} className={`${inputClass} resize-y`} style={inputStyle} {...register('message')} />
        {errors.message && <span className={errorClass} style={errorStyle} role="alert">{errors.message.message}</span>}
      </label>

      {status === 'error' && (
        <p className="rounded-[10px] border px-3.5 py-3 text-sm" style={{ borderColor: 'rgba(217,72,72,.4)', background: 'rgba(217,72,72,.06)', color: '#d94848' }} role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" disabled={status === 'loading'} className="kz-btn kz-btn-primario w-full disabled:opacity-60" style={{ padding: '15px 22px', fontSize: 16 }}>
        {status === 'loading' ? <T en="Sending..." es="Enviando..." /> : <T en="Request free consultation" es="Solicitar consulta gratis" />}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--mute)' }}>
        <T en="We respond within 24 hours. No spam, ever." es="Respondemos dentro de 24 horas. Nada de spam." />
      </p>
    </form>
  );
}
