import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import React, { useCallback, useState, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { fetchCampaigns } from "@/store/campaignSlice";
// Adjacency List builder
function buildAdjList(nodes, edges) {
  const adj = {};
  nodes.forEach((n) => {
    adj[n.id] = { to: [], from: [] };
  });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].to.push(e.target);
    if (adj[e.target]) adj[e.target].from.push(e.source);
  });
  return adj;
}

// Recursively builds a linked tree avoiding cycles
function buildLinkedTree(nodeId, nodesById, adj, parentId = null) {
  const node = nodesById[nodeId];
  if (!node || node.type !== "logic") return null;

  const neighborIds = [...adj[nodeId].to, ...adj[nodeId].from].filter(
    (id) => id !== parentId
  );

  const filterIds = neighborIds.filter((id) => nodesById[id]?.type === "filter");
  const logicIds = neighborIds.filter((id) => nodesById[id]?.type === "logic");

  const filters = filterIds.map((fid) => {
    const f = nodesById[fid];
    return { field: f.data.field, operator: f.data.operator, value: f.data.value };
  });

  const nextId = logicIds.length > 0 ? logicIds[0] : null;

  return {
    logic: node.data.label,
    filters,
    next: nextId ? buildLinkedTree(nextId, nodesById, adj, nodeId) : null,
  };
}

function buildSegmentPayload(nodes, edges) {
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const adj = buildAdjList(nodes, edges);

  let rootCandidates = nodes
    .filter((n) => n.type === "logic")
    .filter((n) => {
      const neighbors = [...(adj[n.id]?.to || []), ...(adj[n.id]?.from || [])];
      let logicCount = 0,
        filterCount = 0;
      neighbors.forEach((id) => {
        const nb = nodesById[id];
        if (!nb) return;
        if (nb.type === "logic") logicCount++;
        if (nb.type === "filter") filterCount++;
      });
      return logicCount === 1 && filterCount === 1;
    });

  if (rootCandidates.length !== 1 && Object.keys(adj).length > 0) {
    for (const node of nodes) {
      if (node.type !== "logic") continue;
      rootCandidates = [node];
      break;
    }
  }

  if (rootCandidates.length !== 1) {
    console.error("Expected a single head logic node, found:", rootCandidates);
    alert("Couldn't uniquely identify the head logic node.");
    return null;
  }

  const root = rootCandidates[0];
  return buildLinkedTree(root.id, nodesById, adj);
}

// Node components with delete button
const FilterNode = ({ data }) => {
  const { onChange, onDelete, field, operator, value } = data;
  const fieldOptions = ["totalSpend", "totalVisits", "gender"];
  const operatorOptions = [">", "<", "="];

  return (
    <div className="bg-white border rounded p-2 w-48 shadow text-black relative">
      <Handle type="target" position={Position.Top} />
      <button
        className="absolute top-1 right-1 text-red-500 text-xs"
        onClick={() => onDelete(data.id)}
      >
        ✖
      </button>
      <div className="text-sm font-medium mb-1">Filter</div>

      <select
        className="border px-2 py-1 w-full text-xs rounded mb-1 text-black"
        value={field}
        onChange={(e) => onChange("field", e.target.value, data.id)}
      >
        <option value="">Select Field</option>
        {fieldOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <select
        className="border px-2 py-1 w-full text-xs rounded mb-1 text-black"
        value={operator}
        onChange={(e) => onChange("operator", e.target.value, data.id)}
      >
        <option value="">Select Operator</option>
        {operatorOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <input
        className="border px-2 py-1 w-full text-xs rounded text-black"
        value={value}
        placeholder="Enter a value"
        onChange={(e) => onChange("value", e.target.value, data.id)}
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const LogicNode = ({ data }) => {
  const { onChange, onDelete, label, id } = data;
  return (
    <div className="bg-blue-100 border rounded px-4 py-2 w-32 text-center shadow text-black relative">
      <Handle type="target" position={Position.Top} />
      <button
        className="absolute top-1 right-1 text-red-600 text-xs"
        onClick={() => onDelete(id)}
      >
        ✖
      </button>
      <div
        className="cursor-pointer font-bold text-blue-700"
        onClick={() => onChange(id)}
      >
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = { filter: FilterNode, logic: LogicNode };

export default function SegmentFlow({ rules }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [logicLabel, setLogicLabel] = useState("AND");
  const [showPreview, setShowPreview] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [campaignTitle, setCampaignTitle] = useState("");
  const dispatch = useDispatch();
const navigate = useNavigate();
  // delete handler
  const handleDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const updateFilterData = useCallback((field, value, id) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    );
  }, [setNodes]);

  const updateLogicLabel = useCallback((id) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id && node.type === "logic"
          ? {
              ...node,
              data: { ...node.data, label: node.data.label === "AND" ? "OR" : "AND" },
            }
          : node
      )
    );
  }, [setNodes]);

  const addLogicNode = () => {
    const id = String(Date.now());
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "logic",
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: { id, label: logicLabel, onChange: updateLogicLabel, onDelete: handleDeleteNode },
      },
    ]);
  };

  const addFilterNode = useCallback(() => {
    const logicNode = [...nodes].reverse().find((n) => n.type === "logic");
    if (!logicNode) return alert("Please add a Logic node first.");

    const id = String(Date.now());
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "filter",
        position: { x: Math.random() * 400 + 100, y: logicNode.position.y + 100 },
        data: { id, field: "", operator: "", value: "", onChange: updateFilterData, onDelete: handleDeleteNode },
      },
    ]);
    setEdges((eds) => [
      ...eds,
      {
        id: `e${id}-${logicNode.id}`,
        source: id,
        target: logicNode.id,
        animated: true,
      },
    ]);
  }, [nodes, setNodes, setEdges, updateFilterData, handleDeleteNode]);

  const previewSegment = async () => {
    const segment = buildSegmentPayload(nodes, edges);
    if (!segment) return;
    const params = new URLSearchParams({ segment: JSON.stringify(segment) });
    const res = await fetch(`https://convergeb.onrender.com/api/segments/preview?${params}`);
    const data = await res.json();
    setMatchCount(data.count);
    setShowPreview(true);
  };

  const saveSegment = async () => {
    if (!campaignTitle) return alert("Please enter a campaign title.");
    const segment = buildSegmentPayload(nodes, edges);
    if (!segment) return;
    const res = await fetch(`https://convergeb.onrender.com/api/segments/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: campaignTitle, segment , count: matchCount}),
    });
    const data = await res.json();
    alert(`Campaign "${data.title}" saved!`);
     dispatch(fetchCampaigns());
    setShowPreview(false);
    navigate("/campaign");
  };

  // Enhance nodes with callbacks for ReactFlow
  const enhancedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: node.type === "logic" ? updateLogicLabel : updateFilterData,
          onDelete: handleDeleteNode,
        },
      })),
    [nodes, updateFilterData, updateLogicLabel, handleDeleteNode]
  );

  return (
    <>
      <div style={{ height: "100vh" }}>
        <ReactFlow
          nodes={enhancedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
          
        >
          <Controls />
          <Background />
        </ReactFlow>

        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">
          <Button variant="secondary" onClick={addLogicNode}>
            ➕ Add AND/OR Node
          </Button>
          <Button variant="secondary" onClick={addFilterNode}>
            ➕ Add Filter Node
          </Button>
          <Button variant="default" onClick={previewSegment}>
            🔍 Preview
          </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Segment</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Matching customers: {matchCount}</p>
          <input
            type="text"
            placeholder="Campaign Title"
            className="border px-3 py-2 w-full rounded mb-4"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
          />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={saveSegment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}