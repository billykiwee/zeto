export function truncateId(id?: string, maxLength = 8) {
  if (id) {
    return id.length > maxLength ? id.slice(0, maxLength) + "..." : id;
  }
}
