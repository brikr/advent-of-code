// Convert a day to a two-character string.
// e.g. 2 -> "02"
//     25 -> "25"
export function dayToString(day: number): string {
  return String(day).padStart(2, '0');
}
