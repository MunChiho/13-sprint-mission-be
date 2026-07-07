export function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: '파일이 없습니다.' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}
