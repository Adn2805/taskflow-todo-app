/**
 * Generates an .ics file string and triggers a browser download.
 * @param {Object} task - The task object containing title, description, due_date
 */
export const downloadICS = (task) => {
  if (!task || !task.due_date) return;

  // ICS dates must be in YYYYMMDDTHHMMSSZ format
  // We assume the due date is a full day event or starts at a specific time.
  // The provided due_date string is parseable by Date.
  
  const startDate = new Date(task.due_date);
  
  // Create an end date 1 hour after the start date
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startIcs = formatDate(startDate);
  const endIcs = formatDate(endDate);
  const nowIcs = formatDate(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaskFlow//TaskFlow Calendar 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTAMP:${nowIcs}`,
    `UID:${task.id}-${nowIcs}@taskflow.app`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${task.title}`,
    `DESCRIPTION:${task.description || ''}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Task Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Create a blob and download link
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};
