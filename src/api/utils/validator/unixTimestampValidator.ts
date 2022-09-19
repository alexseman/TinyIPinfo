const unixTimestampValidator = (timestamp) => {
  return Number.isInteger(timestamp) && isFinite(timestamp);
};

export default unixTimestampValidator;

