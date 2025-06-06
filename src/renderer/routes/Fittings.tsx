import React from 'react';
import { FittingProvider } from '../context/FittingProvider';
import { FittingEditor } from '../components/FittingEditor';

const Fittings = () => {
  return (
    <div>
      <h2>Fittings</h2>
      <FittingProvider>
        <FittingEditor />
      </FittingProvider>
    </div>
  );
};

export default Fittings; 