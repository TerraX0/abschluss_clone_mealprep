export function holeWochentage(): Date[] {
    const montag = new Date();
    montag.setHours(0, 0, 0, 0);
    montag.setDate(montag.getDate() - ((montag.getDay() + 6) % 7));

    const wochentage: Date[] = [];
    for (let tagIndex = 0; tagIndex < 7; tagIndex++) {
        const wochentag = new Date(montag);
        wochentag.setDate(montag.getDate() + tagIndex);
        wochentage.push(wochentag);
    }
    return wochentage;
}