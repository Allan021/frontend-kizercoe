import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind sin que se pisen (shadcn/ui lo usa en cada componente). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
