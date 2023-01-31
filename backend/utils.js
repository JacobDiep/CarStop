import jwt from 'jsonwebtoken';

const TOKEN = 'CarStopRulez'; // <--- this prob shouldnt be hardcoded 🤡

export const generateToken = (user) => {
  return jwt.sign({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, TOKEN, {
      expiresIn: '30d',
  });
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).send({ message: 'No Token' });
    
  const token = authorization.slice(7, authorization.length);
    
  jwt.verify(token, TOKEN, (err, decode) => {
	if (err) return res.status(401).send({ message: 'Invalid Token' });

	req.user = decode;
	next();
      
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role != 'admin') return res.status(401).send({ message: 'Invalid Admin Token' });
    
  next();
};
export const isEmployee = (req, res, next) => {
	if (req.user && (req.user.role != 'employee' && req.user.role != 'admin')) return res.status(401).send({ message: 'Invalid Employee Token' });
	
	next();

};