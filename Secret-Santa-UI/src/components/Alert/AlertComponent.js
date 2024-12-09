import React from 'react';
import { useAlert } from '../../context/AlertContext';

const AlertComponent = () => {
  const { alert } = useAlert();

  if (!alert || (typeof alert.message !== 'string' && typeof alert.data !== 'string')) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: alert.type === 'success' ? 'green' : 'red',
        color: 'white',
        borderRadius: '5px',
        fontWeight: 'bold',
        zIndex: '1000',
      }}
    >
      {alert.message ?? alert.data}
    </div>
  );
};

export default AlertComponent;
