export function getFormattedTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
}
