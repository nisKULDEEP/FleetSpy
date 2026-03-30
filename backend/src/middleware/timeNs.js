const timeNs = () => {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    
    // Attach a function to res to easily get the nanosecond timestamp at any time during routing
    res.getTimeNs = () => {
      // Return the current HR clock for logging/sending in API responses
      return process.hrtime.bigint().toString();
    };

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const elapsedNs = end - start;
      const elapsedMs = Number(elapsedNs) / 1e6;
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${elapsedMs.toFixed(3)} ms)`);
    });
    next();
  };
};
export default timeNs;
