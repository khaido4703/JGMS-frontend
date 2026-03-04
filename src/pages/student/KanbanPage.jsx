import KanbanBoard from "../../components/student/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Sprint Board</h1>
      </div>
      <KanbanBoard />
    </div>
  );
}
