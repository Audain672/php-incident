// AUDIT ÉTAPE 1 → REFONTE ÉTAPE 2
// ──────────────────────────────────────────────────────────────────
// CE QUI A CHANGÉ (Étape 2) :
//   - Suppression de la <Popup> Leaflet native
//   - Suppression de createIncidentIcon local (déplacé dans markerFactory.js)
//   - Suppression de IncidentPopup (la fiche de détail sera dans IncidentDetailPanel)
//   - L'icône est maintenant recréée via createIncidentIcon(typeCode, state)
//     depuis markerFactory.js — 3 états : 'normal' | 'hovered' | 'active'
//   - Click → appelle selectIncident(uuid) dans useMapStore
//   - mouseenter → appelle hoverIncident(uuid)
//   - mouseleave → appelle hoverIncident(null)
//   - useMemo recalcule l'icône uniquement si type, isSelected ou isHovered change
//
// DÉPENDANCES :
//   - createIncidentIcon (markerFactory.js)
//   - useMapStore : selectIncident, hoverIncident, selectedIncidentUuid,
//                  hoveredIncidentUuid
//   - react-leaflet : Marker
// ──────────────────────────────────────────────────────────────────

/**
 * Incident Marker Component
 * DUMB component — affiche un marqueur Leaflet dynamique à 3 états visuels.
 * Ne fait aucun appel API ni logique métier.
 * @component
 */

import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import useMapStore from '../../store/useMapStore.js';
import { createIncidentIcon } from '../../utils/markerFactory.js';

/**
 * Calcule l'état visuel du marqueur selon sa sélection/survol.
 * @param {boolean} isSelected - true si c'est l'incident sélectionné
 * @param {boolean} isHovered  - true si la souris est au-dessus
 * @returns {'active'|'hovered'|'normal'}
 */
const resolveMarkerState = (isSelected, isHovered) => {
  if (isSelected) return 'active';
  if (isHovered)  return 'hovered';
  return 'normal';
};

/**
 * Incident Marker component
 *
 * @param {object}   props
 * @param {object}   props.incident - Données de l'incident
 * @param {string}   props.incident.uuid      - Identifiant unique
 * @param {number}   props.incident.latitude  - Latitude GPS
 * @param {number}   props.incident.longitude - Longitude GPS
 * @param {string}   props.incident.type      - Type d'incident (ex: 'accident')
 * @returns {JSX.Element|null}
 */
const IncidentMarker = ({ incident }) => {
  // ── Lecture du store ──────────────────────────────────────────
  const selectIncident       = useMapStore((s) => s.selectIncident);
  const hoverIncident        = useMapStore((s) => s.hoverIncident);
  const selectedIncidentUuid = useMapStore((s) => s.selectedIncidentUuid);
  const hoveredIncidentUuid  = useMapStore((s) => s.hoveredIncidentUuid);

  // Null-guard : si l'incident n'a pas de coordonnées, on n'affiche rien
  if (!incident?.latitude || !incident?.longitude) return null;

  // ── Calcul de l'état visuel ───────────────────────────────────
  const uuid       = incident.uuid ?? incident.id;
  const isSelected = selectedIncidentUuid === uuid;
  const isHovered  = hoveredIncidentUuid  === uuid;
  const state      = resolveMarkerState(isSelected, isHovered);

  // ── Icône memoïsée ────────────────────────────────────────────
  // Recréée uniquement si le type ou l'état visuel change.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const icon = useMemo(
    () => createIncidentIcon(incident.type?.toUpperCase(), state),
    // incident.type est stable ; state dépend de isSelected/isHovered
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incident.type, state],
  );

  // ── Gestionnaires d'événements ────────────────────────────────
  const eventHandlers = useMemo(() => ({
    /**
     * Click → sélectionner cet incident (ouvre le panneau de détail
     * via isDetailPanelOpen dans le store, géré par MapPage).
     */
    click: () => selectIncident(uuid),

    /** Survol entrant → mettre en évidence */
    mouseover: () => hoverIncident(uuid),

    /** Survol sortant → retirer la mise en évidence */
    mouseout: () => hoverIncident(null),
  }), [uuid, selectIncident, hoverIncident]);

  return (
    <Marker
      position={[incident.latitude, incident.longitude]}
      icon={icon}
      eventHandlers={eventHandlers}
      /* Les marqueurs actifs passent au-dessus des autres */
      zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
    />
  );
};

export default IncidentMarker;
