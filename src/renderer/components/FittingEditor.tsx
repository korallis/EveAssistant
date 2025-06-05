import { useContext } from 'react';
import { FittingContext } from '../context/FittingProvider';

export const FittingEditor = () => {
  const context = useContext(FittingContext);

  if (!context) {
    return <div>No fitting loaded</div>;
  }

  const { fitting } = context;

  if (!fitting) {
    return <div>No fitting loaded</div>;
  }

  return (
    <div>
      <h2>{fitting.ship.typeName}</h2>
      {/* TODO: Render fitting details */}
    </div>
  );
}; 