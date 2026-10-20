import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { panelAsistente, type MensajeIA } from '@/lib/api';

/**
 * El asistente del panel: un chat con Claude que ve tus leads, visitas,
 * instalaciones y staff. Responde "¿qué leads de cámaras no he contestado?",
 * "¿cuál es la clave del DVR de Wendy?" o "resumime el día". No cambia nada:
 * lee y redacta; lo que haya que guardar lo hacés vos.
 */

const SUGERENCIAS = [
  'Resumime el día: qué tengo que atender primero',
  '¿Qué órdenes del taller tienen saldo pendiente?',
  '¿Cuánto hemos cobrado este mes y qué falta por cobrar?',
  '¿Qué leads de cámaras llevan más de dos días sin contestar?',
  '¿Cuántos metros de cable llevamos en las instalaciones de este mes?',
  'Redactá el aviso de equipo listo para la última orden del taller',
];

export function PanelAsistente() {
  const [mensajes, setMensajes] = useState<MensajeIA[]>([]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [mensajes, pensando]);

  async function enviar(t = texto) {
    const limpio = t.trim();
    if (!limpio || pensando) return;
    const charla = [...mensajes, { rol: 'user' as const, texto: limpio }];
    setMensajes(charla);
    setTexto('');
    setPensando(true);
    try {
      const r = await panelAsistente(charla);
      setMensajes([...charla, { rol: 'assistant', texto: r.respuesta }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'El asistente no respondió');
      setMensajes(mensajes);
      setTexto(limpio);
    } finally {
      setPensando(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] flex-col">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kzp-titulo flex items-center gap-2">
            <Sparkles className="text-accent-foreground" size={22} /> Asistente
          </h2>
          <p className="kzp-sub">Ve tus leads, visitas, instalaciones, taller, servicios y cobros al momento. Preguntale como a alguien del equipo.</p>
        </div>
        {mensajes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMensajes([])}><Trash2 /> Nueva conversación</Button>
        )}
      </div>

      <div className="kz-card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {mensajes.length === 0 && (
            <div className="mx-auto max-w-xl py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><Bot size={26} /></span>
              <p className="mt-4 text-lg font-bold">¿Qué querés saber?</p>
              <p className="mt-1 text-sm text-muted-foreground">Probá con una de estas o escribí lo tuyo.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {SUGERENCIAS.map((s) => (
                  <button key={s} onClick={() => enviar(s)} className="rounded-xl border border-border bg-muted px-4 py-3 text-left text-[13px] transition-colors hover:border-ring hover:bg-accent hover:text-accent-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mensajes.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.rol === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.rol === 'user' ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'}`}>
                {m.rol === 'user' ? <User size={15} /> : <Bot size={15} />}
              </span>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${m.rol === 'user' ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm border border-border bg-muted/70'}`}>
                {m.texto}
              </div>
            </div>
          ))}
          {pensando && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Bot size={15} /></span>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-muted/70 px-4 py-3">
                <span className="kz-eyebrow flex items-center gap-2 !text-[11px]"><span className="kz-latido" /> pensando</span>
              </div>
            </div>
          )}
          <div ref={fin} />
        </div>

        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
        >
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void enviar();
              }
            }}
            rows={1}
            placeholder="Preguntá por un lead, una instalación, el día… (Enter envía, Shift+Enter salta línea)"
            className="min-h-[44px] resize-none bg-background"
            aria-label="Mensaje para el asistente"
          />
          <Button type="submit" size="icon" disabled={!texto.trim() || pensando} aria-label="Enviar"><Send /></Button>
        </form>
      </div>
    </section>
  );
}
