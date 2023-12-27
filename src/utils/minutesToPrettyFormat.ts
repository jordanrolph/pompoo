// Examples
//   console.log(minutesToPrettyFormat(0));     // "All clear"
//   console.log(minutesToPrettyFormat(12));    // "12 min"
//   console.log(minutesToPrettyFormat(63));    // "1 h 3 m"
//   console.log(minutesToPrettyFormat(6063));  // "101 hrs"
//   console.log(minutesToPrettyFormat(60023)); // "41 days"

export function minutesToPrettyFormat(
  minutes: number,
  useFullUnits: boolean,
): string {
  let h = "h";
  let m = "m";
  if (useFullUnits) {
    h = "hours";
    m = "minutes";
  }

  if (minutes === 0) {
    return "All clear";
  } else if (minutes < 60) {
    return `${minutes} ${m}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 100) {
      return `${hours} ${h} ${remainingMinutes} ${m}`;
    } else {
      const formattedHours = new Intl.NumberFormat().format(hours);
      return `${formattedHours} hrs`;
    }
  }
}

export function minutesToFullHoursOrDays(minutes: number): string {
  // 1440 minutes = 24 hours
  if (minutes >= 1440) {
    const fullDays = Math.floor(minutes / 1440);
    // Plural day(s) if needed
    return `${fullDays} day${fullDays > 1 ? "s" : ""}`;
  }

  if (minutes < 60) {
    return "less than 1 hour";
  } else {
    const fullHours = Math.floor(minutes / 60);
    // Plural day(s) if needed
    return `${fullHours} hour${fullHours > 1 ? "s" : ""}`;
  }
}
