"use client";

import React from "react";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

type Spec = {
  id: string;
  model: string;
  volts: string;
  capacity: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
  sortOrder: number;
};

interface SpecsReorderListProps {
  specs: Spec[];
  onDragEnd: (result: DropResult) => void;
  onEdit: (spec: Spec) => void;
  onDelete: (id: string) => void;
}

export default function SpecsReorderList({
  specs,
  onDragEnd,
  onEdit,
  onDelete,
}: SpecsReorderListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="specs-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="divide-y divide-slate-100 dark:divide-white/5"
          >
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-mono font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
              <div className="col-span-1"></div>
              <div className="col-span-3">Model</div>
              <div className="col-span-2">Volts / Cap</div>
              <div className="col-span-3">Dimensions (L×B×H)</div>
              <div className="col-span-2">Weight</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {specs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-gray-500">
                No specifications added yet.
              </div>
            ) : (
              specs.map((spec, index) => (
                <Draggable key={spec.id} draggableId={spec.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="grid grid-cols-12 gap-4 p-4 items-center bg-white dark:bg-[#0C0D14] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="col-span-1 text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="col-span-3 font-medium text-slate-900 dark:text-white">{spec.model}</div>
                      <div className="col-span-2 text-slate-600 dark:text-gray-400 font-mono text-xs">
                        {spec.volts} / {spec.capacity}
                      </div>
                      <div className="col-span-3 text-slate-600 dark:text-gray-400 text-xs font-mono">
                        {spec.length} × {spec.breadth} × {spec.height}
                      </div>
                      <div className="col-span-2 text-slate-900 dark:text-white font-medium text-xs font-mono">{spec.weight}</div>
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(spec)}
                          className="text-slate-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-primary transition-colors p-1 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(spec.id)}
                          className="text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
