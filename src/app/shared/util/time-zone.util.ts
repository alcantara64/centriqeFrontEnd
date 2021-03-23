import { DateTime } from "luxon";


export function handleDateTimeZoneReceive(dateString: string, timeZone: string): Date {
  let date = DateTime.fromISO(dateString)
  date = date.setZone(timeZone).setZone('local', { keepLocalTime: true });
  return date.toJSDate();
}

export function handleDateTimeZoneSend(dateObj: Date, timeZone: string): Date {
  let date = DateTime.fromJSDate(dateObj)
  date = date.setZone(timeZone, { keepLocalTime: true });
  console.log()
  return date.toJSDate();
}
