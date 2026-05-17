// Verifica se está autenticado
exports.isAuth = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  res.redirect('/login');
};

// Fábrica de middleware de perfil
exports.isPerfil = (...perfis) => (req, res, next) => {
  if (req.session && perfis.includes(req.session.perfil)) return next();
  res.redirect('/login');
};
