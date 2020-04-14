const { validationResult } = require("express-validator");
const ms = require("ms");
const { getUserReqMsg, getAuthMsg } = require("../utils/logging-utils");
const HttpError = require("../models/classes/http-error");
const authService = require("../services/auth-service");
const { cookieNames, setCookie } = require("../utils/cookie-utils");
const { TOKENLIFE: tokenLife, ERRORS } = require("../utils/const-utils");

const controllerName = "auth-controller";

exports.checkAuth = (req, res) => {
  // Executions
  res.json(req.jwtDecoded.data);
};

exports.checkRole = (req, res, next) => {
  const actionName = "checkRole";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { roles } = req.body;
  // Executions
  if (roles.indexOf(req.jwtDecoded.data.role) < 0) {
    return next(new HttpError(...ERRORS.AUTH.UNAUTHORIZED));
  }
  return res.status(200).send();
};

exports.performLogin = async (req, res, next) => {
  const actionName = "performLogin";
  // Validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    getUserReqMsg(`${controllerName}.${actionName}`, errors);
    return res.status(422).json(errors);
  }
  // Declarations
  const { username, password, remember } = req.body;
  // Executions
  try {
    const result = await authService.performLogin(username, password, remember);
    const { accessToken, refreshToken, userAccount } = result;
    // Remember => Refresh Cookie expires at the same time as REFRESH Token. Otherwise, Refresh Cookie expires at the same time as ACCESS Token (Not allowing to perform refresh token)
    const refreshCookieExpires = remember ? ms(tokenLife.refresh) : ms(tokenLife.access);
    setCookie(res, cookieNames.accessToken, accessToken, ms(tokenLife.refresh));
    setCookie(res, cookieNames.refreshToken, refreshToken, refreshCookieExpires);
    return res.json({ userAccount });
  } catch (error) {
    getAuthMsg(`${controllerName}.${actionName}`, error);
    if ([ERRORS.AUTH.LOGIN_USERNAME[0], ERRORS.AUTH.LOGIN_PASSWORD[0]].indexOf(error.name) >= 0) {
      return next(new HttpError(error.name, error.message, error.code));
    }
    return next(new HttpError(...ERRORS.UNKNOWN.MISC.AUTH_LOGIN));
  }
};

exports.performSignOut = async (req, res, next) => {
  const actionName = "performSignOut";
  // Declarations
  const refreshTokenFromClient = req.cookies[cookieNames.refreshToken];
  const { id } = req.jwtDecoded.data;
  // Executions
  res.clearCookie(cookieNames.accessToken);
  res.clearCookie(cookieNames.refreshToken);
  try {
    await authService.performSignOut(refreshTokenFromClient, id);
    return res.status(200).send();
  } catch (error) {
    getAuthMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.MISC.AUTH_LOGOUT));
  }
};

exports.performSignOutAllSessions = async (req, res, next) => {
  const actionName = "performSignOutAllSessions";
  // Declarations
  const { id } = req.jwtDecoded.data;
  // Executions
  res.clearCookie(cookieNames.accessToken);
  res.clearCookie(cookieNames.refreshToken);
  try {
    await authService.performSignOutAllSessions(id);
    return res.status(200).send();
  } catch (error) {
    getAuthMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.UNKNOWN.MISC.AUTH_LOGOUTSESSIONS));
  }
};

exports.performRefreshToken = async (req, res, next) => {
  const actionName = "performRefreshToken";
  // Declarations
  const refreshTokenFromClient = req.cookies[cookieNames.refreshToken];
  // Executions
  try {
    const accessToken = await authService.performRefreshToken(refreshTokenFromClient);
    setCookie(res, cookieNames.accessToken, accessToken, ms(tokenLife.refresh));
    return res.status(200).send();
  } catch (error) {
    getAuthMsg(`${controllerName}.${actionName}`, error);
    return next(new HttpError(...ERRORS.INVALID.AUTH_TOKEN));
  }
};