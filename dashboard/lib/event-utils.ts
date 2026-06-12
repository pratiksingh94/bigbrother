export function truncate(s: string, max = 100) {
    return s.length > max ? s.slice(0, 100) + "..." : s
}