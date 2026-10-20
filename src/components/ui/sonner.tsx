import { useEffect, useState } from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Avisos (toasts) del panel. El tema se lee del data-theme del sitio, no de
 * next-themes: en Astro el tema lo maneja el toggle del layout.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const leer = () => setTheme((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light');
    leer();
    const obs = new MutationObserver(leer);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
