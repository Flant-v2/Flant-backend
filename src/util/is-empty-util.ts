export const isEmpty = (value: any): boolean => {
  return (
    typeof value === 'undefined' ||
    value === null ||
    value === '' ||
    value === 'null' ||
    value.length === 0 ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'object' && !Object.keys(value).length)
  );
};
