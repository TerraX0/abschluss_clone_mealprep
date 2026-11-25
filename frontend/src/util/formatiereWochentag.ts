export function formatiereWochentag(datum: Date): string {
    return datum.toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
}