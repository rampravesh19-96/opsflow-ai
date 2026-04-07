import { formatDateTime } from "@/lib/format";
import type { OrderNote } from "@/server/types/domain";

export function NoteList({ notes }: { notes: OrderNote[] }) {
  if (!notes.length) {
    return <p className="text-sm text-muted">No internal notes yet for this order.</p>;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-white">{note.author}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-subtle">
              {formatDateTime(note.createdAt)}
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{note.body}</p>
        </div>
      ))}
    </div>
  );
}
