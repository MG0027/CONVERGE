import React, { useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const defaultRules = [
  { id: "1", field: "total_spent", operator: ">", value: "10000" },
  { id: "2", field: "views", operator: "<", value: "3" },
];

function SortableRule({ rule, index, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-zinc-900 p-3 border border-zinc-700 rounded mb-2 text-black"
    >
      <div {...attributes} {...listeners} className="cursor-move text-gray-400 px-1">
        ::
      </div>

      {/* Field dropdown */}
      <select
        value={rule.field}
        onChange={(e) => onChange(index, { ...rule, field: e.target.value })}
        className="bg-zinc-800 border border-zinc-600 rounded text-black px-2 py-1 text-sm"
      >
        <option value="">Select Field</option>
        <option value="totalSpent">totalSpent</option>
        <option value="totalVisits">totalVisits</option>
        <option value="gender">gender</option>
        <option value="city">city</option>
      </select>

      {/* Operator dropdown */}
      <select
        value={rule.operator}
        onChange={(e) => onChange(index, { ...rule, operator: e.target.value })}
        className="bg-zinc-800 border border-zinc-600 rounded text-black px-2 py-1 text-sm"
      >
        <option value="">Op</option>
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value="=">=</option>
      </select>

      {/* Value text input */}
      <Input
        placeholder="Value"
        value={rule.value}
        onChange={(e) => onChange(index, { ...rule, value: e.target.value })}
        className="bg-zinc-800 border-zinc-600 text-black"
      />

      <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>
        Remove
      </Button>
    </div>
  );
}

export default function SegmentBuilder({ onRuleUpdate }) {
  const [rules, setRules] = useState(defaultRules);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      setRules((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const handleRuleChange = (index, updatedRule) => {
    setRules((prev) => prev.map((r, i) => (i === index ? updatedRule : r)));
    if (onRuleUpdate) {
      onRuleUpdate(updatedRule); // Pass updated rule to parent (React Flow)
    }
  };

  const handleRemove = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    const newRule = { id: Date.now().toString(), field: "", operator: "", value: "" };
    setRules((prev) => [...prev, newRule]);
    if (onRuleUpdate) {
      onRuleUpdate(newRule); // Pass new rule to parent (React Flow)
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Segment</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {rules.map((rule, index) => (
            <SortableRule
              key={rule.id}
              rule={rule}
              index={index}
              onChange={handleRuleChange}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button className="mt-4" onClick={addRule}>+ Add Rule</Button>
    </div>
  );
}
