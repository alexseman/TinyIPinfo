import getUnixTime from 'date-fns/getUnixTime';

export const secondsInTimeframe = {
  secondsInDay: 86400,
  secondsInWeek: 604800,
  secondsInMonth: 2629800,
  secondsInYear: 31557600
};

export const getStartOfDayUTC = (dateTime: string | undefined = undefined): Date => {
  let startOfDay;

  if (dateTime) {
    startOfDay = new Date(dateTime);
  } else {
    startOfDay = new Date();
  }

  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay;
};

export const getEndOfDayUTC = (dateTime: string | undefined = undefined): Date => {
  let endOfDay;

  if (dateTime) {
    endOfDay = new Date(dateTime);
  } else {
    endOfDay = new Date();
  }

  endOfDay.setUTCHours(23, 59, 59, 999);
  return endOfDay;
};

export const getStartOfDayTimestamp = (dateTime: string | undefined = undefined): number => {
  return getUnixTime(getStartOfDayUTC(dateTime));
};

export const getEndOfDayTimestamp = (dateTime: string | undefined = undefined): number => {
  return getUnixTime(getEndOfDayUTC(dateTime));
};
