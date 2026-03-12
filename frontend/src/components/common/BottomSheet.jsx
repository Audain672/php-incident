/**
 * @file BottomSheet.jsx
 * @description Composant générique de bottom sheet draggable pour mobile.
 * Implémente le comportement "Google Maps" avec 3 crantages (snap points).
 *
 * DÉPENDANCES :
 *   - Tailwind CSS 3
 *   - React (useState, useRef, useEffect)
 */

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Points d'ancrage en pixels/vh (traduits en % de translateY)
// 0 = Réduit (100px visible)
// 1 = Mi-ouvert (60vh)
// 2 = Plein écran (92vh)
const SNAP_HEIGHTS = ['100px', '60vh', '92vh'];

const BottomSheet = ({ isOpen, snapIndex, onSnap, children }) => {
  const touchStartY = useRef(0);
  const touchStartSnap = useRef(snapIndex);
  
  // false = transition CSS activée (par cohorte), true = suit le doigt (désactivée)
  const [isDragging, setIsDragging] = useState(false);
  const [currentTranslate, setCurrentTranslate] = useState(0); // Offset en px pendant le drag

  // Réinitialiser le translate si l'index de snap change ou l'état open
  useEffect(() => {
    if (!isDragging) {
      setCurrentTranslate(0);
    }
  }, [snapIndex, isOpen, isDragging]);

  if (!isOpen) return null;

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartSnap.current = snapIndex;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    // On empêche de trop tirer vers le haut au-delà du max, ou vers le bas au-delà du min
    // (Optionnel : ajouter une résistance/friction)
    setCurrentTranslate(deltaY);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = touchStartY.current - e.changedTouches[0].clientY;

    // Seuil de déclenchement (swipe de 60px)
    if (deltaY > 60 && snapIndex < 2) {
      // Glisser vers haut = ouvrir +
      onSnap(snapIndex + 1);
    } else if (deltaY < -60 && snapIndex > 0) {
      // Glisser vers bas = fermer -
      onSnap(snapIndex - 1);
    } else {
      // Retour à la position d'origine (fait par useEffect via isDragging=false)
      setCurrentTranslate(0);
    }
  };

  // Convertit l'index de snap en classe de hauteur Tailiwnd
  const getHeightClass = () => {
    switch(snapIndex) {
      case 0: return 'h-[100px]';
      case 1: return 'h-[60vh]';
      case 2: return 'h-[92vh]';
      default: return 'h-[60vh]';
    }
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
        flex flex-col overflow-hidden md:hidden
        ${!isDragging ? 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''}
        ${getHeightClass()}
      `}
      style={{
        transform: `translateY(${currentTranslate > 0 ? currentTranslate : currentTranslate * 0.3}px)`,
        touchAction: 'none' // Désactiver le scroll natif pendant le drag sur la poignée
      }}
    >
      {/* Poignée de drag */}
      <div 
        className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing bg-white relative z-10 shrink-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
      </div>

      {/* Contenu - gère son propre scroll natif, touchAction pan-y autorisé si index=1 ou 2 */}
      <div 
        className="flex-1 w-full bg-white relative overflow-y-auto overscroll-contain"
        style={{ touchAction: snapIndex > 0 ? 'pan-y' : 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

BottomSheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  snapIndex: PropTypes.number.isRequired,
  onSnap: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default BottomSheet;
