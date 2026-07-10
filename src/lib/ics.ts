function fmt(d: Date) {
  return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function buildIcs(opts: {
  uid: string;
  title: string;
  description: string;
  location?: string;
  startsAt: string;
  endsAt: string;
}) {
  const start = fmt(new Date(opts.startsAt));
  const end = fmt(new Date(opts.endsAt));
  const stamp = fmt(new Date());
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rhythm Raga//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@rhytthmraga.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    opts.location ? `LOCATION:${esc(opts.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
