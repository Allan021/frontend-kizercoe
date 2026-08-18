import { useEffect, useState } from 'react';

export type Lang = 'en' | 'es';

/**
 * El idioma del sitio vive en `<html lang>` y lo cambia el botón del nav.
 *
 * Para texto visible se prefiere <T>, que pinta las dos versiones y deja que
 * el CSS esconda la que sobra: así no parpadea antes de hidratar. Este hook es
 * para lo que no puede ser dos nodos — placeholders, aria-label, <option>,
 * mensajes de validación.
 */
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const leer = () =>
      setLang(document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en');
    leer();
    // El botón cambia el atributo, no dispara ningún evento: se observa.
    const observador = new MutationObserver(leer);
    observador.observe(document.documentElement, { attributeFilter: ['lang'] });
    return () => observador.disconnect();
  }, []);

  return lang;
}

/** Texto en los dos idiomas; el CSS (`html[lang]`) muestra el que toca. */
export function T({ en, es }: { en: string; es: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="es">{es}</span>
    </>
  );
}
