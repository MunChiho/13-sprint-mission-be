export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || '서버 오류가 발생했습니다.';
  res.status(status).json({ message });
}

export function notFound(req, res) {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
}

export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
