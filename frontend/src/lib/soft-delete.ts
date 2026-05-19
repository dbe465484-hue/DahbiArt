export type SoftDeletable = { deletedAt?: string | null };

export function isDeleted(row: SoftDeletable): boolean {
  return row.deletedAt != null && row.deletedAt !== "";
}
