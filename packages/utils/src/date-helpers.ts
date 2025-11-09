export const isDateInFuture = (date: Date): boolean => {
  return new Date(date).getTime() > Date.now();
};

export const formatDate = (date: Date): string => {
  return new Date(date).toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
