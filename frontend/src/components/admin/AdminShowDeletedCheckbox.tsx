"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AdminShowDeletedCheckbox({ checked, onChange }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-stone-300"
      />
      Afficher les supprimés
    </label>
  );
}
