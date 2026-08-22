// NSE Trading Holidays for 2026 (Format: YYYY-MM-DD)
const NSE_HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  '2026-03-03', // Holi
  '2026-03-20', // Id-Ul-Fitr
  '2026-03-27', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-04-21', // Mahavir Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-05-27', // Bakri Id
  '2026-06-25', // Muharram
  '2026-08-15', // Independence Day
  '2026-08-26', // Milad-un-Nabi
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-08', // Diwali Laxmi Pujan
  '2026-11-09', // Diwali Balipratipada
  '2026-11-24', // Gurunanak Jayanti
  '2026-12-25'  // Christmas
];

/**
 * Converts a Date object to Indian Standard Time (IST, UTC+5:30) Date parts.
 */
function getISTDateParts(date = new Date()) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utc + istOffsetMs);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const dayOfWeek = istDate.getDay(); // 0 = Sun, 6 = Sat

  return { dateStr, dayOfWeek, timeInMinutes, hours, minutes };
}

/**
 * Checks if the Indian stock market (NSE) is currently open.
 * Returns boolean.
 */
function isMarketOpen(date = new Date()) {
  const { dateStr, dayOfWeek, timeInMinutes } = getISTDateParts(date);

  // 1. Check Weekend (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // 2. Check NSE Holiday List
  if (NSE_HOLIDAYS_2026.includes(dateStr)) {
    return false;
  }

  // 3. Check Trading Hours (9:15 AM to 3:30 PM IST)
  // 9:15 AM = 9 * 60 + 15 = 555 minutes
  // 3:30 PM = 15 * 60 + 30 = 930 minutes
  const marketOpenMinutes = 555;
  const marketCloseMinutes = 930;

  if (timeInMinutes >= marketOpenMinutes && timeInMinutes <= marketCloseMinutes) {
    return true;
  }

  return false;
}

/**
 * Returns detailed market status object.
 */
function getMarketCalendarInfo(date = new Date()) {
  const { dateStr, dayOfWeek, timeInMinutes } = getISTDateParts(date);
  const open = isMarketOpen(date);

  let reason = 'Market is OPEN';
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    reason = `Market Closed (Weekend - ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`;
  } else if (NSE_HOLIDAYS_2026.includes(dateStr)) {
    reason = `Market Closed (NSE Holiday - ${dateStr})`;
  } else if (timeInMinutes < 555) {
    reason = 'Market Closed (Pre-market / Before 9:15 AM IST)';
  } else if (timeInMinutes > 930) {
    reason = 'Market Closed (After 3:30 PM IST)';
  }

  return {
    isOpen: open,
    status: open ? 'OPEN' : 'CLOSED',
    reason,
    dateStr
  };
}

module.exports = {
  NSE_HOLIDAYS_2026,
  isMarketOpen,
  getMarketCalendarInfo
};
