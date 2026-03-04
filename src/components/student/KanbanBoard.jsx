import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const LABEL_COLORS = {
  "GITHUB INTEGRATION": { bg: "#6d28d9", text: "#fff" },
  "FRONTEND TASK": { bg: "#0369a1", text: "#fff" },
  "BACKEND TASK": { bg: "#065f46", text: "#fff" },
  DATABASE: { bg: "#92400e", text: "#fff" },
};

const PRIORITY_ICONS = {
  Highest: { color: "#ef4444", d: "M5 15l7-7 7 7" },
  High: { color: "#f97316", d: "M5 12l7-7 7 7" },
  Medium: { color: "#eab308", d: "M8 12h8" },
  Low: { color: "#3b82f6", d: "M5 9l7 7 7-7" },
  Lowest: { color: "#8b5cf6", d: "M5 9l7 7 7-7M5 14l7 7 7-7" },
};

const INITIAL_COLUMNS = {
  "TO DO": {
    id: "TO DO",
    title: "TO DO",
    items: [
      {
        id: "JGMS-52",
        title: "Write unit tests for auth module",
        label: "GITHUB INTEGRATION",
        priority: "Medium",
        assignee: null,
      },
      {
        id: "JGMS-53",
        title: "Update project documentation",
        label: "GITHUB INTEGRATION",
        priority: "Low",
        assignee: null,
      },
    ],
  },
  "IN PROGRESS": {
    id: "IN PROGRESS",
    title: "IN PROGRESS",
    items: [
      {
        id: "JGMS-38",
        title: "Connect to Github repository",
        label: "GITHUB INTEGRATION",
        priority: "High",
        assignee: "HH",
      },
      {
        id: "JGMS-43",
        title: "Collect commit data",
        label: "GITHUB INTEGRATION",
        priority: "High",
        assignee: "HH",
      },
      {
        id: "JGMS-47",
        title: "View individual commit statistics",
        label: "GITHUB INTEGRATION",
        priority: "Medium",
        assignee: "HH",
      },
      {
        id: "JGMS-51",
        title: "The lecturer assesses the level of contribution",
        label: "GITHUB INTEGRATION",
        priority: "Highest",
        assignee: "HH",
      },
    ],
  },
  DONE: {
    id: "DONE",
    title: "DONE",
    items: [],
  },
};

const COLUMN_ORDER = ["TO DO", "IN PROGRESS", "DONE"];

function PriorityIcon({ priority }) {
  const icon = PRIORITY_ICONS[priority];
  if (!icon) return null;
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke={icon.color}
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icon.d} />
    </svg>
  );
}

function Avatar({ initials, color = "#6366f1" }) {
  return (
    <div
      className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function KanbanCard({ item, index }) {
  const labelKey = Object.keys(LABEL_COLORS).find((k) =>
    item.label.startsWith(k),
  );
  const labelStyle = LABEL_COLORS[labelKey] || { bg: "#6d28d9", text: "#fff" };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-md border border-slate-200 p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging
              ? "shadow-lg rotate-1 border-blue-300"
              : "shadow-sm hover:shadow-md hover:border-slate-300"
          }`}
        >
          {/* Title */}
          <p className="text-sm text-slate-800 font-medium leading-snug mb-2">
            {item.title}
          </p>

          {/* Label badge */}
          <div className="mb-3">
            <span
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
              style={{
                backgroundColor: labelStyle.bg,
                color: labelStyle.text,
              }}
            >
              {item.label.length > 28
                ? item.label.substring(0, 28) + "..."
                : item.label}
            </span>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Bookmark icon + task ID */}
              <svg
                className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
              </svg>
              <span className="text-xs text-slate-500 font-medium">
                {item.id}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <PriorityIcon priority={item.priority} />
              {/* Team icon */}
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {/* Assignee */}
              {item.assignee ? (
                <Avatar initials={item.assignee} color="#ef4444" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function KanbanColumn({ column, columnId }) {
  const headerColors = {
    "TO DO": "text-slate-600",
    "IN PROGRESS": "text-blue-600",
    DONE: "text-emerald-600",
  };

  const countBgColors = {
    "TO DO": "bg-slate-100 text-slate-600",
    "IN PROGRESS": "bg-blue-100 text-blue-700",
    DONE: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="flex flex-col min-w-70 w-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${headerColors[columnId] || "text-slate-600"}`}
          >
            {column.title}
          </span>
          {column.items.length > 0 && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${countBgColors[columnId] || "bg-slate-100 text-slate-600"}`}
            >
              {column.items.length}
            </span>
          )}
        </div>
        {columnId === "TO DO" && (
          <span className="text-slate-400 text-lg font-light cursor-pointer hover:text-slate-600 select-none">
            ···
          </span>
        )}
        {columnId !== "TO DO" && (
          <span className="text-slate-400 text-lg font-light cursor-pointer hover:text-slate-600 select-none">
            ···
          </span>
        )}
      </div>

      {/* Drop zone */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-30 rounded-lg p-2 transition-colors ${
              snapshot.isDraggingOver
                ? "bg-blue-50 border-2 border-dashed border-blue-300"
                : "bg-slate-50 border-2 border-transparent"
            }`}
          >
            {column.items.map((item, index) => (
              <KanbanCard key={item.id} item={item} index={index} />
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {column.items.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-20 text-slate-400">
                <svg
                  className="h-8 w-8 mb-1 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-xs">No issues</span>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add item button */}
      {columnId === "TO DO" && (
        <button className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md px-2 py-1.5 transition-colors w-full">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create issue</span>
        </button>
      )}
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceItems = [...sourceCol.items];
    const destItems =
      source.droppableId === destination.droppableId
        ? sourceItems
        : [...destCol.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: { ...sourceCol, items: sourceItems },
      [destination.droppableId]: { ...destCol, items: destItems },
    }));
  };

  const totalItems = Object.values(columns).reduce(
    (sum, col) => sum + col.items.length,
    0,
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search board"
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44"
              />
            </div>

            {/* Avatar group */}
            <div className="flex items-center -space-x-1">
              <Avatar initials="HH" color="#ef4444" />
            </div>

            {/* Filter button */}
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V20a1 1 0 01-.553.894l-4-2A1 1 0 018 18v-4.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              Filter
            </button>

            {/* Group button */}
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors">
              Group
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Chart icon */}
            <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>

            {/* Settings icon */}
            <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
          </div>

          {/* Complete Sprint button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors shadow-sm">
            Complete sprint
          </button>
        </div>
      </div>

      {/* Sprint label */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-800">
            Sprint Board
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {totalItems} issues
          </span>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="px-6 pb-6 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max md:min-w-0">
            {COLUMN_ORDER.map((colId) => (
              <div key={colId} className="w-72 shrink-0">
                <KanbanColumn column={columns[colId]} columnId={colId} />
              </div>
            ))}

            {/* Add column button */}
            <div className="w-10 shrink-0 flex items-start pt-1">
              <button className="h-8 w-8 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
