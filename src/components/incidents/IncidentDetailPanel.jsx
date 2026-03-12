/**
 * @file IncidentDetailPanel.jsx
 * @description Panneau de détail d'incident — style Google Maps.
 * DUMB component : reçoit tout via props, ne fait aucun appel API.
 *
 * - Desktop (md+) : glissement depuis la droite dans le panneau latéral
 * - Mobile (< md) : montée depuis le bas (bottom sheet, 60vh)
 *
 * DÉPENDANCES :
 *   - date-fns (formatDistanceToNow, fr locale)
 *   - markerFactory.js (INCIDENT_VISUAL_CONFIG)
 *   - Tailwind CSS 3
 */

import React, { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { INCIDENT_VISUAL_CONFIG } from '../../utils/markerFactory.js';
import { INCIDENT_STATUS, SEVERITY_LEVELS } from '../../utils/constants.js';

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Formate une date en texte relatif en français.
 * @param {string|Date} dateValue
 * @returns {string} Ex : "il y a 2 heures"
 */
const toRelativeDate = (dateValue) => {
  if (!dateValue) return 'Date inconnue';
  try {
    return formatDistanceToNow(new Date(dateValue), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return 'Date inconnue';
  }
};

/**
 * Construit l'URL d'une photo d'incident à partir de photo_path.
 * Compatible avec le stockage Laravel (storage/photo_path).
 * @param {string|null} photoPath
 * @returns {string|null}
 */
const buildPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
  // Remplace /api par la racine du serveur si photo_path est dans /storage
  const serverRoot = base.replace(/\/api\/?$/, '');
  return `${serverRoot}/storage/${photoPath}`;
};

// ── Sous-composants ────────────────────────────────────────────────

/**
 * Vignette photo avec fallback emoji en cas d'erreur de chargement.
 */
const IncidentPhoto = ({ photoPath, emoji, title }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = buildPhotoUrl(photoPath);

  if (!photoUrl || imgError) {
    return (
      <div className="w-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center"
           style={{ aspectRatio: '16/9' }}>
        <span className="text-6xl select-none" role="img" aria-hidden="true">
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={title}
      loading="lazy"
      onError={() => setImgError(true)}
      className="w-full object-cover"
      style={{ aspectRatio: '16/9' }}
    />
  );
};

/**
 * Ligne de méta-information avec icône.
 */
const MetaRow = ({ icon, children }) => (
  <div className="flex items-start gap-2 text-sm text-neutral-600">
    <span className="shrink-0 mt-0.5">{icon}</span>
    <span>{children}</span>
  </div>
);

// ── Composant principal ────────────────────────────────────────────

/**
 * Panneau de détail d'incident.
 *
 * @param {object}   props
 * @param {object|null} props.incident     - Données de l'incident à afficher
 * @param {boolean}  props.isOpen          - Panneau visible ?
 * @param {boolean}  props.isAdmin         - Afficher le bouton Supprimer ?
 * @param {function} props.onClose         - Fermer le panneau
 * @param {function} props.onDelete        - (uuid) => void
 * @param {function} props.onCenterMap     - Recentrer la carte sur l'incident
 * @param {boolean}  [props.isDeleting]    - Suppression en cours ?
 */
const IncidentDetailPanel = ({
  incident,
  isOpen,
  isAdmin,
  onClose,
  onDelete,
  onCenterMap,
  isDeleting = false,
}) => {
  // Résolution de la config visuelle du type
  const typeCode  = incident?.type?.toUpperCase() ?? 'DANGER_ZONE';
  const typeConf  = INCIDENT_VISUAL_CONFIG[typeCode] ?? INCIDENT_VISUAL_CONFIG.DANGER_ZONE;

  // Résolution du statut
  const statusCode = incident?.status?.toUpperCase();
  const statusConf = INCIDENT_STATUS[statusCode] ?? null;

  // Résolution de la sévérité
  const severityCode = incident?.severity?.toUpperCase();
  const severityConf = SEVERITY_LEVELS[severityCode] ?? null;

  // ── Gestion de la suppression ───────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!incident) return;
    const uuid = incident.uuid ?? incident.id;
    onDelete(uuid);
  }, [incident, onDelete]);

  // ── Classes d'animation selon breakpoint ───────────────────────
  //   Desktop : translateX (depuis la droite)
  //   Mobile  : translateY (depuis le bas) — géré via classes Tailwind
  const panelTranslate = isOpen ? 'translate-x-0 translate-y-0' : 'translate-x-full md:translate-x-full translate-y-full md:translate-y-0';

  return (
    <>
      {/* ── Backdrop mobile ────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Panneau principal ───────────────────────────────────── */}
      <div
        role="complementary"
        aria-label="Détail de l'incident"
        aria-hidden={!isOpen}
        className={[
          // === Position & dimensionnement ===
          // Mobile : bottom sheet pleine largeur, 60vh depuis le bas
          'fixed bottom-0 left-0 right-0 z-30',
          'md:static md:h-full',              // Desktop : dans le flux normal
          // === Forme mobile ===
          'rounded-t-2xl md:rounded-none',
          // === Couleur & ombre ===
          'bg-white shadow-2xl',
          // === Scroll interne ===
          'overflow-y-auto',
          // === Hauteur ===
          'max-h-[62vh] md:max-h-full',
          // === Transition & animation ===
          'transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          panelTranslate,
        ].join(' ')}
      >
        {/* — Poignée mobile — */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* ── En-tête : badge type + bouton fermer ─────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
            style={{ backgroundColor: typeConf.color }}
          >
            <span className="text-sm">{typeConf.emoji}</span>
            <span>{typeConf.label}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Corps du panneau ─────────────────────────────────── */}
        {incident ? (
          <div className="flex flex-col">

            {/* Photo 16:9 avec fallback */}
            <IncidentPhoto
              photoPath={incident.photo_path ?? incident.image ?? null}
              emoji={typeConf.emoji}
              title={incident.title}
            />

            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">

              {/* Titre + label type */}
              <div>
                <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                  {incident.title ?? 'Incident sans titre'}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {typeConf.label}
                </p>
              </div>

              {/* Badges statut + sévérité */}
              {(statusConf || severityConf) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {statusConf && (
                    <span
                      className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: statusConf.color }}
                    >
                      {statusConf.label}
                    </span>
                  )}
                  {severityConf && (
                    <span
                      className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: severityConf.color }}
                    >
                      {severityConf.label}
                    </span>
                  )}
                </div>
              )}

              {/* Méta-informations */}
              <div className="flex flex-col gap-2">
                {/* Coordonnées */}
                {incident.latitude != null && incident.longitude != null && (
                  <MetaRow icon="📍">
                    {Number(incident.latitude).toFixed(4)}, {Number(incident.longitude).toFixed(4)}
                    {(incident.address ?? incident.locationName) && (
                      <> — {incident.address ?? incident.locationName}</>
                    )}
                  </MetaRow>
                )}

                {/* Date relative */}
                <MetaRow icon="🕐">
                  {toRelativeDate(incident.createdAt ?? incident.created_at)}
                </MetaRow>

                {/* Auteur */}
                {(incident.user ?? incident.reportedBy) && (
                  <MetaRow icon="👤">
                    Signalé par{' '}
                    {incident.user
                      ? `${incident.user.firstName ?? ''} ${incident.user.lastName ?? ''}`.trim()
                      : incident.reportedBy}
                  </MetaRow>
                )}
              </div>

              {/* Description */}
              {incident.description && (
                <p className="text-sm text-neutral-700 leading-relaxed border-t border-neutral-100 pt-4">
                  {incident.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
                {/* Centrer sur la carte */}
                <button
                  onClick={onCenterMap}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors duration-150"
                >
                  <span>🗺️</span>
                  Centrer sur la carte
                </button>

                {/* Supprimer — admin uniquement */}
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Suppression…
                      </>
                    ) : (
                      <>
                        <span>🗑️</span>
                        Supprimer l'incident
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* État vide — ne devrait pas être visible (panneau fermé) */
          <div className="flex flex-col items-center justify-center h-40 text-neutral-400 text-sm">
            <span className="text-3xl mb-2">📍</span>
            Sélectionnez un incident sur la carte
          </div>
        )}
      </div>
    </>
  );
};

export default IncidentDetailPanel;
