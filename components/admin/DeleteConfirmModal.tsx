interface Props {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ name, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Delete Category?</h2>
        <p className="text-sm text-slate-400">
          Are you sure you want to delete <span className="text-white font-semibold">"{name}"</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 