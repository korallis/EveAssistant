import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import './Fitting.css';

const Draggable = ({ id, children, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    ...transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: isDragging ? 100 : 'auto',
        }
      : {},
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const Droppable = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = {
    backgroundColor: isOver ? 'lightblue' : '#eee',
  };

  return (
    <div ref={setNodeRef} style={style} className="droppable">
      {children}
    </div>
  );
};

const Fitting = () => {
  const [modules, setModules] = useState([
    { id: 'module-1', name: 'Gatling Railgun I', slot: null },
    { id: 'module-2', name: '1MN Afterburner I', slot: null },
    { id: 'module-3', name: 'Damage Control I', slot: null },
  ]);

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveId(null);

    if (over) {
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.id === active.id) {
            return { ...module, slot: over.id };
          }
          // Handle swapping if a module is already in the slot
          if (module.slot === over.id) {
            const draggedModule = prevModules.find(m => m.id === active.id);
            return { ...module, slot: draggedModule.slot };
          }
          return module;
        })
      );
    }
  };

  const slots = ['high-slot-1', 'mid-slot-1', 'low-slot-1'];
  const modulesInBay = modules.filter((m) => m.slot === null);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="fitting-container">
        <div className="module-bay">
          <h3>Module Bay</h3>
          {modulesInBay.map((module) => (
            <Draggable key={module.id} id={module.id} isDragging={activeId === module.id}>
              <div className="draggable-module">{module.name}</div>
            </Draggable>
          ))}
        </div>
        <div className="fitting-slots">
          <h3>Fitting Slots</h3>
          {slots.map((slotId) => {
            const moduleInSlot = modules.find((m) => m.slot === slotId);
            return (
              <Droppable key={slotId} id={slotId}>
                {moduleInSlot ? (
                  <Draggable key={moduleInSlot.id} id={moduleInSlot.id} isDragging={activeId === moduleInSlot.id}>
                    <div className="draggable-module">{moduleInSlot.name}</div>
                  </Draggable>
                ) : (
                  slotId.replace('-', ' ')
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
};

export default Fitting; 