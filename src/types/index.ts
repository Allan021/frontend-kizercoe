export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget?: string;
  message: string;
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
