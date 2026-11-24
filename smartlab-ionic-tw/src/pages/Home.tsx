import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import { FilterOption, Incident, IncidentPriority } from '../types/incident';

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Fallo de enlace en Switch Rack B',
    location: 'Aula 204 - Redes',
    description: 'Pérdida intermitente de paquetes en puertos Gigabit 12 al 16.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '09:15',
  },
  {
    id: 'INC-102',
    title: 'Actualización de imágenes Docker',
    location: 'Laboratorio DAM 2',
    description: 'Desplegar imagen base Node 22 Alpine en estaciones de trabajo.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '10:30',
  },
  {
    id: 'INC-103',
    title: 'Calibración de proyector láser',
    location: 'Aula Magna',
    description: 'Ajuste trapezoidal y verificación de entrada HDMI.',
    priority: 'baja',
    status: 'resuelta',
    createdAt: 'Ayer',
  },
  {
    id: 'INC-104',
    title: 'Teclado sin respuesta en puesto 07',
    location: 'Aula 112 - DAM 1',
    description: 'El puerto USB frontal no reconoce periféricos HID.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '11:02',
  },
];

/* ---------- Tokens de estilo reutilizables (brutalismo) ---------- */

// Interacción estándar de un elemento "pulsable": se levanta en hover y se hunde al pulsar
const PRESSABLE =
  'border-3 border-ink shadow-brut transition-[transform,box-shadow] duration-150 ease-out ' +
  'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brut-lg ' +
  'active:translate-x-[6px] active:translate-y-[6px] active:shadow-none ' +
  'focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cobalt';

const PRIORITY_STYLES: Record<IncidentPriority, { band: string; label: string }> = {
  alta: { band: 'bg-alarm text-white', label: 'ALTA' },
  media: { band: 'bg-signal text-ink', label: 'MEDIA' },
  baja: { band: 'bg-mint text-ink', label: 'BAJA' },
};

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'resuelta', label: 'Resueltas' },
];

const INPUT =
  'w-full border-3 border-ink bg-white px-4 py-3 font-mono text-base text-ink ' +
  'placeholder:text-ink/40 shadow-brut-sm outline-none transition-[transform,box-shadow] duration-150 ' +
  'focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brut focus:bg-acid/20';

const Home: React.FC = () => {
  // Estado principal de datos y controles UI
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado controlado del formulario modal
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  const listSectionRef = useRef<HTMLElement | null>(null);

  // Indicadores KPI memoizados
  const metrics = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter((item) => item.status === 'pendiente').length;
    const resolved = incidents.filter((item) => item.status === 'resuelta').length;
    const critical = incidents.filter(
      (item) => item.status === 'pendiente' && item.priority === 'alta'
    ).length;
    return { total, pending, resolved, critical };
  }, [incidents]);

  // Filtrado combinado por estado y búsqueda textual
  const filteredIncidents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return incidents.filter((item) => {
      const matchesStatus = activeFilter === 'todas' || item.status === activeFilter;
      const matchesQuery =
        normalizedQuery === '' ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.id.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  // Toast propio: se oculta solo a los 2,2 s
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('Estado sincronizado con el servidor');
      event.detail.complete();
    }, 700);
  };

  const handleToggleStatus = (id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pendiente' ? 'resuelta' : 'pendiente' }
          : item
      )
    );
    setToastMessage(`Estado de ${id} actualizado`);
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
    setToastMessage(`Incidencia ${id} eliminada`);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setToastMessage('El título y la ubicación son obligatorios');
      return;
    }

    const newIncident: Incident = {
      id: `INC-${Math.floor(105 + Math.random() * 894)}`,
      title: title.trim(),
      location: location.trim(),
      description: description.trim() || 'Sin observaciones adicionales.',
      priority,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setTitle('');
    setLocation('');
    setDescription('');
    setPriority('media');
    setIsModalOpen(false);
    setToastMessage(`Incidencia ${newIncident.id} registrada`);
  };

  const scrollToList = () =>
    listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const marqueeText = `● ${metrics.pending} PENDIENTES ● ${metrics.critical} CRÍTICAS ● ${metrics.resolved} RESUELTAS ● SMARTLAB MONITOR ● DAM 0488 `;

  const kpis = [
    { label: 'Total', value: metrics.total, tone: 'bg-white', tilt: 'lg:-rotate-2' },
    { label: 'Pendientes', value: metrics.pending, tone: 'bg-signal', tilt: 'lg:rotate-1' },
    { label: 'Críticas', value: metrics.critical, tone: 'bg-alarm text-white', tilt: 'lg:rotate-2' },
    { label: 'Resueltas', value: metrics.resolved, tone: 'bg-mint', tilt: 'lg:-rotate-1' },
  ];

  return (
    <IonPage>
      {/* ===== Cabecera brutalista (altura fija h-16 = 4rem) ===== */}
      <IonHeader className="ion-no-border">
        <nav className="flex h-16 items-stretch justify-between border-b-3 border-ink bg-paper font-body">
          <div className="flex items-center gap-3 border-r-3 border-ink bg-acid px-4 sm:px-6">
            <span className="h-3 w-3 animate-blink rounded-full bg-alarm" aria-hidden="true" />
            <span className="font-display text-xl uppercase tracking-crush sm:text-2xl">
              SmartLab
            </span>
          </div>

          <div className="flex items-stretch">
            <div className="hidden items-center gap-2 border-l-3 border-ink px-5 font-mono text-sm uppercase sm:flex">
              Pendientes
              <span className="bg-ink px-2 py-0.5 font-bold text-acid">{metrics.pending}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="border-l-3 border-ink bg-ink px-4 font-display text-sm uppercase text-acid transition-colors hover:bg-cobalt hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-acid sm:px-6 sm:text-base"
            >
              + Nueva
            </button>
          </div>
        </nav>
      </IonHeader>

      <IonContent fullscreen className="brut-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        <div className="font-body text-ink">
          {/* ===== HERO: ocupa exactamente el alto útil de la pantalla (100dvh - cabecera) ===== */}
          <section
            aria-label="Resumen del estado del centro"
            className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-8 overflow-hidden border-b-3 border-ink px-4 py-8 sm:px-8 lg:h-[calc(100dvh-4rem)] lg:min-h-[620px] lg:px-12"
          >
            <div className="brut-dots pointer-events-none absolute -right-10 top-10 h-[45vh] w-[45vw] opacity-20" aria-hidden="true" />

            <p className="relative font-mono text-xs uppercase tracking-widest sm:text-sm">
              [ Monitor de incidencias · Desarrollo de Interfaces 0488 ]
            </p>

            <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
              {/* Titular monumental: tracking negativo + interlineado cerrado */}
              <h1 className="whitespace-nowrap font-display text-mega uppercase tracking-crush lg:col-span-7 lg:text-[min(12vw,13rem)]">
                Smart
                <br />
                <span className="inline-block -rotate-2 border-3 border-ink bg-acid px-3 shadow-brut-lg">
                  Lab
                </span>
                <span className="text-alarm">.</span>
              </h1>

              {/* KPIs en retícula 2x2, ligeramente rotados en escritorio (broken grid) */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-5">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`${kpi.tone} ${kpi.tilt} border-3 border-ink p-4 shadow-brut transition-transform duration-200 hover:rotate-0 hover:scale-105 lg:hover:rotate-0 sm:p-5`}
                  >
                    <p className="font-mono text-xs uppercase tracking-wider">{kpi.label}</p>
                    <p className="mt-1 font-display text-5xl leading-none sm:text-6xl">
                      {String(kpi.value).padStart(2, '0')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col gap-4 pr-20 sm:flex-row sm:items-center sm:pr-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={`${PRESSABLE} bg-acid px-6 py-4 font-display text-base uppercase sm:text-lg`}
              >
                Registrar incidencia →
              </button>
              <button
                type="button"
                onClick={scrollToList}
                className={`${PRESSABLE} bg-white px-6 py-4 font-display text-base uppercase sm:text-lg`}
              >
                Ver listado ↓
              </button>
            </div>
          </section>

          {/* ===== Marquesina infinita (se pausa al pasar el ratón) ===== */}
          <div className="relative z-10 -mx-4 -my-3 -rotate-1 overflow-hidden border-y-3 border-ink bg-ink py-3 text-acid">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]" aria-hidden="true">
              {[0, 1].map((copy) => (
                <span key={copy} className="whitespace-nowrap pr-8 font-display text-2xl uppercase sm:text-3xl">
                  {marqueeText.repeat(3)}
                </span>
              ))}
            </div>
            <p className="sr-only">
              {metrics.pending} pendientes, {metrics.critical} críticas, {metrics.resolved} resueltas
            </p>
          </div>

          {/* ===== LISTADO: sección de al menos una pantalla completa ===== */}
          <section
            ref={listSectionRef}
            aria-label="Listado de incidencias"
            className="min-h-[100dvh] scroll-mt-4 px-4 pb-32 pt-16 sm:px-8 lg:px-12"
          >
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="font-display text-huge uppercase tracking-crush">
                Incidencias
                <span className="ml-3 inline-block translate-y-[-0.15em] border-3 border-ink bg-signal px-3 align-middle text-3xl shadow-brut-sm sm:text-4xl">
                  {filteredIncidents.length}
                </span>
              </h2>

              {/* Filtro segmentado */}
              <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap border-3 border-ink shadow-brut">
                {FILTERS.map((f) => {
                  const active = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveFilter(f.value)}
                      className={`flex-1 border-ink px-4 py-3 font-mono text-sm font-bold uppercase transition-colors [&:not(:first-child)]:border-l-3 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-cobalt ${
                        active ? 'bg-ink text-acid' : 'bg-white hover:bg-acid'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mb-10 block">
              <span className="mb-2 block font-mono text-xs uppercase tracking-widest">
                Buscar por código, título o aula
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. INC-101, Docker, Aula 204…"
                className={INPUT}
              />
            </label>

            {filteredIncidents.length === 0 ? (
              <div className="border-3 border-dashed border-ink bg-white p-10 text-center">
                <p className="font-display text-2xl uppercase">Nada por aquí.</p>
                <p className="mt-2 font-mono text-sm">Ninguna incidencia coincide con el filtro.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filteredIncidents.map((incident) => {
                  const p = PRIORITY_STYLES[incident.priority];
                  const resolved = incident.status === 'resuelta';
                  return (
                    <li
                      key={incident.id}
                      className={`group flex flex-col border-3 border-ink shadow-brut transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brut-xl md:odd:-rotate-1 md:even:rotate-1 md:hover:rotate-0 ${
                        resolved ? 'bg-paper' : 'bg-white'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b-3 border-ink px-4 py-2 font-mono text-xs font-bold uppercase ${p.band}`}>
                        <span>{incident.id}</span>
                        <span>Prioridad {p.label}</span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className={`font-display text-xl uppercase leading-tight sm:text-2xl ${
                              resolved ? 'text-ink/40 line-through decoration-4' : ''
                            }`}
                          >
                            {incident.title}
                          </h3>
                          <span className="shrink-0 font-mono text-xs">{incident.createdAt}</span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed">{incident.description}</p>

                        <p className="mt-4 font-mono text-xs uppercase">
                          📍 <strong>{incident.location}</strong>
                        </p>

                        <div className="mt-auto flex gap-3 pt-6">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(incident.id)}
                            className={`${PRESSABLE} flex-1 px-3 py-2 font-mono text-xs font-bold uppercase shadow-brut-sm hover:shadow-brut ${
                              resolved ? 'bg-signal' : 'bg-mint'
                            }`}
                          >
                            {resolved ? '↺ Reabrir' : '✓ Resolver'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIncident(incident.id)}
                            aria-label={`Eliminar ${incident.id}`}
                            className={`${PRESSABLE} bg-white px-4 py-2 font-mono text-xs font-bold uppercase shadow-brut-sm hover:bg-alarm hover:text-white hover:shadow-brut`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ===== Pie ===== */}
          <footer className="flex min-h-[40vh] flex-col justify-end gap-6 border-t-3 border-ink bg-ink px-4 py-10 text-paper sm:px-8 lg:px-12">
            <p className="font-display text-huge uppercase tracking-crush text-acid">
              Fix it.
              <br />
              Ship it.
            </p>
            <div className="flex flex-col justify-between gap-2 font-mono text-xs uppercase sm:flex-row">
              <span>SmartLab Monitor · React + Ionic + Tailwind CSS</span>
              <span>Daniel Baeza Jiménez · 2º DAM · 2026</span>
            </div>
          </footer>
        </div>

        {/* ===== Botón flotante ===== */}
        <div slot="fixed" className="bottom-5 right-5 sm:bottom-8 sm:right-8">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Registrar nueva incidencia"
            className={`${PRESSABLE} grid h-16 w-16 place-items-center bg-alarm font-display text-4xl text-white`}
          >
            +
          </button>
        </div>

        {/* ===== Toast propio ===== */}
        {toastMessage && (
          <div
            slot="fixed"
            role="status"
            aria-live="polite"
            className="bottom-5 left-4 right-24 animate-toast-in border-3 border-ink bg-acid px-5 py-3 font-mono text-sm font-bold uppercase shadow-brut sm:bottom-8 sm:left-8 sm:right-auto"
          >
            {toastMessage}
          </div>
        )}

        {/* ===== Modal de alta ===== */}
        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
          className="brut-modal"
        >
          <div className="flex h-full flex-col overflow-y-auto bg-paper font-body text-ink">
            <div className="flex items-center justify-between border-b-3 border-ink bg-acid px-5 py-4">
              <h2 className="font-display text-2xl uppercase tracking-crush">Nueva incidencia</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar formulario"
                className="grid h-10 w-10 place-items-center border-3 border-ink bg-white font-display text-xl transition-transform hover:rotate-90 hover:bg-alarm hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-5 p-5">
              <label className="block">
                <span className="mb-2 block font-mono text-xs font-bold uppercase">Título *</span>
                <input
                  className={INPUT}
                  placeholder="Ej. Error de compilación en SDK"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-xs font-bold uppercase">Aula o ubicación *</span>
                <input
                  className={INPUT}
                  placeholder="Ej. Laboratorio 102"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </label>

              <fieldset>
                <legend className="mb-2 block font-mono text-xs font-bold uppercase">Prioridad</legend>
                <div className="grid grid-cols-3 gap-3">
                  {(['alta', 'media', 'baja'] as IncidentPriority[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={priority === value}
                      onClick={() => setPriority(value)}
                      className={`border-3 border-ink py-3 font-mono text-xs font-bold uppercase transition-[transform,box-shadow] ${
                        priority === value
                          ? `${PRIORITY_STYLES[value].band} translate-x-[3px] translate-y-[3px]`
                          : 'bg-white shadow-brut-sm hover:bg-acid/40'
                      }`}
                    >
                      {PRIORITY_STYLES[value].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-2 block font-mono text-xs font-bold uppercase">Descripción técnica</span>
                <textarea
                  className={`${INPUT} min-h-[120px] resize-y`}
                  placeholder="Detalla los síntomas observados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <button type="submit" className={`${PRESSABLE} w-full bg-ink py-4 font-display text-lg uppercase text-acid`}>
                Guardar incidencia
              </button>
            </form>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
