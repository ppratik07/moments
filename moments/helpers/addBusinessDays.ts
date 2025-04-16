export function addBusinessDays(startDate: Date, days: number): Date {
    let count = 0;
    const result = new Date(startDate);

    while (count < days) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
    }

    return result;
}
