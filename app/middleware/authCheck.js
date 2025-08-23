const AuthCheck = (req, res, next) => {
  const token =
    req?.body?.token || req?.query?.token || req?.headers["x-access-token"];
  if (!token) {
    return res.status(400).json({
      message: "Token is required for access this page",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("before login data", req.user);
    req.user = decoded;
    console.log("afetr login data", req.user);
  } catch (err) {
    return res.status(400).json({ 
      message: "Invalid token",
    });
  }
  return next();
};


const adminCheck = (req, res, next) => {
  const token =
    req?.body?.token || req?.query?.token || req?.headers["x-access-token"];
  if (!token) {
    return res.status(400).json({
      message: "Token is required for access this page",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded;
    console.log("afetr login data", req.user);
    if (req.user.role !== "admin") {
      return res.status(400).json({
        message: "You are not admin",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  return next();
};
