/**
 * @file FloatingActionButton.jsx
 * @description Bouton d'action flottant (FAB) principal (surtout pour mobile).
 * Fixé en bas à droite, utilisé typiquement pour "Signaler un incident".
 */

import React from 'react';
import PropTypes from 'prop-types';

const FloatingActionButton = ({ onClick, label, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        fixed bottom-10 right-4 z-[998] md:hidden
        w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg
        flex items-center justify-center text-2xl
        hover:bg-primary-700 active:scale-95 transition-all duration-200
        ${className}
      `}
    >
      {icon || '+'}
    </button>
  );
};

FloatingActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default FloatingActionButton;
