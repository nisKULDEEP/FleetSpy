const timeNs = () => {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
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
