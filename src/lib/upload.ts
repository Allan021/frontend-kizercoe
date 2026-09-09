// Subida directa a Cloudinary (unsigned) desde el navegador, igual que en
// KizerPOS. Cloud y preset vienen de env para no hardcodear; los valores por
// defecto son los del proyecto.
const CLOUD = import.meta.env.PUBLIC_CLOUDINARY_CLOUD ?? 'proyectos-personales';
const PRESET = import.meta.env.PUBLIC_CLOUDINARY_PRESET ?? 'ploco-dev';

/**
 * Sube una imagen y avisa cómo va.
 *
 * Con XMLHttpRequest y no con fetch, que no sabe decir cuánto lleva subido.
 * Sin una barra que se mueva, una foto de dos megas en una conexión lenta se
 * ve como una pantalla colgada.
 */
export function subirImagen(file: File, onProgreso?: (pct: number) => void): Promise<string> {
  // El límite real lo pone el preset de Cloudinary, pero rebotar acá es más
  // amable que subir cuatro megas para que el servidor diga que no.
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Eso no es una imagen'));
  }
  if (file.size > 8 * 1024 * 1024) {
    return Promise.reject(new Error('La imagen pesa más de 8 MB. Probá con una más liviana.'));
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);

  return new Promise((ok, mal) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgreso?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) ok(body.secure_url);
        else mal(new Error(body?.error?.message ?? `Error subiendo la imagen (${xhr.status})`));
      } catch {
        mal(new Error(`Error subiendo la imagen (${xhr.status})`));
      }
    };
    xhr.onerror = () => mal(new Error('No hay internet o Cloudinary no contestó'));
    xhr.send(form);
  });
}

/** Miniatura servida por Cloudinary. Otras URLs pasan tal cual. */
export function miniatura(url: string | null, size = 160): string | null {
  if (!url) return null;
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`);
}
