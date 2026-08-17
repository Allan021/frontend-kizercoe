export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget?: string;
  message: string;
  /** Slug del proyecto desde el que escribieron, si vino de uno. */
  projectSlug?: string;
}

export type Practica = 'software' | 'ia' | 'marketing';

export interface Service {
  id?: string;
  slug: string;
  practice: Practica;
  title: string;
  summary: string;
  bullets: string[];
  /** Nombre del ícono de Lucide, sin el prefijo. */
  icon: string | null;
  featured: boolean;
  published: boolean;
  position: number;
}

export interface Testimonial {
  id?: string;
  author: string;
  role: string | null;
  company: string | null;
  text: string;
  rating: number;
  /** El destacado: sale grande y de primero. */
  featured: boolean;
  published: boolean;
  position: number;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  client: string | null;
  period: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  tags: string[];
  published: boolean;
  position: number;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface NavLink {
  href: string;
  label: string;
  isCta?: boolean;
}

export interface ServiceCard {
  icon: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  cta: string;
  ctaVariant: 'outline' | 'filled';
}
