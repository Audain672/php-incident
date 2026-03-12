/**
 * @file markerFactory.js
 * @description Fabrique centralisée de marqueurs Leaflet.
 * Génère des icônes divIcon selon le type d'incident et l'état visuel.
 * Ne contient aucune logique React — fonctions pures uniquement.
 *
 * AUDIT ÉTAPE 2 — NOUVEAU FICHIER
 * ──────────────────────────────────────────────────────────────────
 * Remplace les appels éparpillés à L.divIcon dans IncidentMarker.jsx.
 * Ce fichier est le SEUL endroit du code autorisé à créer des L.divIcon.
 *
 * États visuels supportés :
 *   - 'normal'  → marqueur standard
 *   - 'hovered' → marqueur agrandi au survol (mouseenter)
 *   - 'active'  → marqueur sélectionné avec animation pulse
 *
 * DÉPENDANCES :
 *   - leaflet (L.divIcon)
 * ──────────────────────────────────────────────────────────────────
 */

import L from 'leaflet';

// ── Configuration visuelle par type d'incident ─────────────────────

/**
 * Configuration visuelle pour chaque type d'incident.
 * Les codes correspondent aux valeurs de la propriété `type` retournée
 * par l'API (insensible à la casse — normalisé en majuscules à l'usage).
 */
export const INCIDENT_VISUAL_CONFIG = {
  // Types natifs de l'API
  ACCIDENT:     { emoji: '🚨', color: '#E74C3C', colorActive: '#C0392B', label: 'Accident' },
  FIRE:         { emoji: '🔥', color: '#E67E22', colorActive: '#D35400', label: 'Incendie' },
  FLOOD:        { emoji: '🌊', color: '#2980B9', colorActive: '#1A5276', label: 'Inondation' },
  ROAD_WORK:    { emoji: '🚧', color: '#F39C12', colorActive: '#D68910', label: 'Travaux routiers' },
  OBSTACLE:     { emoji: '🧱', color: '#8E44AD', colorActive: '#6C3483', label: 'Obstacle' },
  WEATHER:      { emoji: '🌦️', color: '#17A589', colorActive: '#0E6655', label: 'Météo' },
  OTHER:        { emoji: '📌', color: '#7F8C8D', colorActive: '#646D6E', label: 'Autre' },

  // Types additionnels pour compatibilité descendante
  ROAD_HOLE:    { emoji: '🕳️', color: '#E67E22', colorActive: '#D35400', label: 'Trou sur la route' },
  POWER_OUTAGE: { emoji: '⚡', color: '#8E44AD', colorActive: '#6C3483', label: 'Panne électrique' },
  DANGER_ZONE:  { emoji: '⚠️', color: '#F39C12', colorActive: '#D68910', label: 'Zone dangereuse' },
};

// ── Dimensions par état ────────────────────────────────────────────

/**
 * Dimensions et ombres pour chaque état visuel.
 * La transition width/height est animée en CSS (markers.css).
 */
const SIZES = {
  normal:  { width: 36, height: 36, fontSize: 18, shadow: '0 2px 6px rgba(0,0,0,0.3)' },
  hovered: { width: 44, height: 44, fontSize: 22, shadow: '0 4px 12px rgba(0,0,0,0.4)' },
  active:  { width: 52, height: 52, fontSize: 26, shadow: '0 6px 20px rgba(0,0,0,0.5)' },
};

// ── Fabrique principale ────────────────────────────────────────────

/**
 * Crée un L.divIcon pour un marqueur d'incident.
 *
 * @param {string} typeCode - Code du type en majuscules (ex: 'ACCIDENT', 'ROAD_HOLE').
 *   Si inconnu, utilise DANGER_ZONE comme fallback.
 * @param {'normal'|'hovered'|'active'} [state='normal'] - État visuel du marqueur.
 * @returns {L.DivIcon} Icône Leaflet prête à l'emploi.
 *
 * @example
 * // Dans un composant React :
 * const icon = useMemo(
 *   () => createIncidentIcon(incident.type?.toUpperCase(), markerState),
 *   [incident.type, markerState]
 * );
 */
export const createIncidentIcon = (typeCode, state = 'normal') => {
  const config =
    INCIDENT_VISUAL_CONFIG[typeCode?.toUpperCase()] ??
    INCIDENT_VISUAL_CONFIG.DANGER_ZONE;
  const size = SIZES[state] ?? SIZES.normal;

  const bgColor      = state === 'active' ? config.colorActive : config.color;
  const borderWidth  = state === 'active' ? 3 : 2;
  const borderColor  = state === 'active' ? '#FFFFFF' : 'rgba(255,255,255,0.8)';
  const scale        = state === 'hovered' ? 'scale(1.05)' : 'scale(1)';

  // Animation pulse visible uniquement sur l'état 'active'
  const pulseHtml = state === 'active'
    ? `<div style="
        position:absolute;
        bottom:-8px;
        left:50%;
        transform:translateX(-50%);
        width:10px;
        height:10px;
        background:${bgColor};
        border-radius:50%;
        box-shadow:0 0 0 3px rgba(255,255,255,0.6);
        animation:markerPulse 1.5s infinite;
      "></div>`
    : '';

  const html = `
    <div style="
      position:relative;
      width:${size.width}px;
      height:${size.height}px;
      background-color:${bgColor};
      border:${borderWidth}px solid ${borderColor};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg) ${scale};
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:${size.shadow};
      transition:all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor:pointer;
    ">
      <span style="
        transform:rotate(45deg);
        font-size:${size.fontSize}px;
        line-height:1;
        user-select:none;
      ">
        ${config.emoji}
      </span>
    </div>
    ${pulseHtml}
  `;

  return L.divIcon({
    html,
    className: `incident-marker incident-marker--${state}`,
    iconSize:    [size.width, size.height],
    iconAnchor:  [size.width / 2, size.height],
    popupAnchor: [0, -size.height],
  });
};

/**
 * Retourne le label affiché pour un type d'incident.
 * @param {string} typeCode - Code du type (ex: 'ACCIDENT')
 * @returns {string} Label lisible
 */
export const getIncidentTypeLabel = (typeCode) => {
  const config = INCIDENT_VISUAL_CONFIG[typeCode?.toUpperCase()];
  return config?.label ?? 'Incident';
};

/**
 * Retourne l'emoji correspondant à un type d'incident.
 * @param {string} typeCode - Code du type (ex: 'FIRE')
 * @returns {string} Emoji
 */
export const getIncidentTypeEmoji = (typeCode) => {
  const config = INCIDENT_VISUAL_CONFIG[typeCode?.toUpperCase()];
  return config?.emoji ?? '📌';
};

export default createIncidentIcon;
