export const formatDateTime = (dateString: string) => {
  const local = dateString.replace('T', ' ').replace('Z', '');

  const [date, time] = local.split(' ');
  const [hours, minutes] = time.split(':');

  let hour = parseInt(hours, 10);
  const amPm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${date} ${hour.toString().padStart(2, '0')}:${minutes} ${amPm}`;
};

export const formatTime = (dateString: string) => {
  const local = dateString.replace('T', ' ').replace('Z', '');
  const time = local.split(' ')[1];
  const [hours, minutes] = time.split(':');

  let hour = parseInt(hours, 10);
  const amPm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${hour.toString().padStart(2, '0')}:${minutes} ${amPm}`;
};

export const formatDate = (dateString: string) => {
  return dateString.replace('T', ' ').replace('Z', '').slice(0, 10);
};