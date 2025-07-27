import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Importa los módulos reales directamente
import * as jwtUtils from '../../../src/Utils/jsonWebTokenUtils.js';
import * as userModel from '../../../src/Models/UserModel.js';
import * as db from '../../../src/Utils/dataBaseConnection.js';
import * as StatusMessage from '../../../src/Utils/StatusMessage.js';
import * as authUtils from '../../../src/Utils/authUtils.js';

describe('authUtils tests without proxyquire', () => {
  before(() => {
    process.env.POSTGRESQL_HOST = 'localhost';
    process.env.POSTGRESQL_USER = 'test_user';
    process.env.POSTGRESQL_PASSWORD = 'test_password';
    process.env.POSTGRESQL_DATABASE = 'test_db';
    process.env.POSTGRESQL_PORT = '5432';

    process.env.ACCESS_TOKEN_EXPIRY = '15m';
    process.env.ACCESS_TOKEN_EXPIRY_COOKIE = '900000';
    process.env.REFRESH_TOKEN_EXPIRY = '30d';
    process.env.REFRESH_TOKEN_EXPIRY_COOKIE = '2592000000';
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.SALT_ROUNDS = '12';
    process.env.BACKEND_NODE_ENV = 'test';
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('checkAuthStatus', () => {
    it('returns authorized if user exists', async () => {
      sinon.stub(userModel, 'findOne').resolves([{ id: '1' }]);
      const req = { session: { user: { id: '1' } } };
      const result = await authUtils.checkAuthStatus(req);
      expect(result.isAuthorized).to.be.true;
    });

    it('returns not authorized if no user in session', async () => {
      const req = { session: {} };
      const result = await authUtils.checkAuthStatus(req);
      expect(result.isAuthorized).to.be.false;
    });

    it('returns not authorized on error', async () => {
      sinon.stub(userModel, 'findOne').rejects(new Error('fail'));
      const req = { session: { user: { id: '1' } } };
      const result = await authUtils.checkAuthStatus(req);
      expect(result.isAuthorized).to.be.false;
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash with SALT_ROUNDS env var', async () => {
      const hashStub = sinon.stub(bcrypt, 'hash').resolves('hashedpass');
      const result = await authUtils.hashPassword('mypass');
      expect(hashStub.calledOnceWith('mypass', 12)).to.be.true;
      expect(result).to.equal('hashedpass');
      hashStub.restore();
    });
  });

  describe('isIgnored', () => {
    it('matches path with wildcard patterns', () => {
      const patterns = ['/api/*', '/auth/*', '/public'];
      expect(authUtils.isIgnored(patterns, '/api/user')).to.be.true;
      expect(authUtils.isIgnored(patterns, '/auth/login')).to.be.true;
      expect(authUtils.isIgnored(patterns, '/public')).to.be.true;
      expect(authUtils.isIgnored(patterns, '/no-match')).to.be.false;
    });
  });

  describe('setSession', () => {
    it('sets session user with decoded token', () => {
      sinon.stub(jwt, 'verify').returns({ id: '123' });
      const req = {};
      authUtils.setSession(req, 'token');
      expect(req.session.user).to.deep.equal({ id: '123' });
      jwt.verify.restore();
    });

    it('handles verify error gracefully', () => {
      sinon.stub(jwt, 'verify').throws(new Error('bad token'));
      const req = {};
      authUtils.setSession(req, 'badtoken');
      expect(req.session.user).to.be.null;
      jwt.verify.restore();
    });
  });

  describe('createAuthTokens', () => {
    it('creates tokens and sets cookies', async () => {
      const res = {
        cookie: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const user = { id: 'user1' };

      sinon.stub(jwtUtils, 'createAccessToken').returns('access-token');
      sinon.stub(jwtUtils, 'createRefreshToken').returns('refresh-token');
      sinon.stub(userModel, 'update').resolves([{ id: 'user1' }]);

      const result = await authUtils.createAuthTokens(res, user);

      expect(res.cookie.calledWith('access_token', 'access-token')).to.be.true;
      expect(res.cookie.calledWith('refresh_token', 'refresh-token')).to.be.true;
      expect(result).to.equal(res);

      jwtUtils.createAccessToken.restore();
      jwtUtils.createRefreshToken.restore();
      userModel.update.restore();
    });

    it('handles null update', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      sinon.stub(userModel, 'update').resolves(null);

      await authUtils.createAuthTokens(res, { id: 'x' });

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ msg: StatusMessage.INTERNAL_SERVER_ERROR })).to.be.true;

      userModel.update.restore();
    });

    it('handles empty update', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      sinon.stub(userModel, 'update').resolves([]);

      await authUtils.createAuthTokens(res, { id: 'x' });

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ msg: StatusMessage.USER_NOT_FOUND })).to.be.true;

      userModel.update.restore();
    });
  });

  describe('registerUser', () => {
    it('registers a unique user', async () => {
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(userModel, 'isUnique').resolves(true);
      sinon.stub(authUtils, 'hashPassword').resolves('hashedpass');
      sinon.stub(userModel, 'create').resolves([{ id: '1' }]);
      sinon.stub(authUtils, 'getPublicUser').resolves({ id: '1', username: 'new' });

      const validatedUser = { data: { username: 'new', password: 'pass' } };
      await authUtils.registerUser(res, validatedUser);

      expect(authUtils.hashPassword.calledOnce).to.be.true;
      expect(userModel.create.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;

      authUtils.hashPassword.restore();
      authUtils.getPublicUser.restore();
      userModel.isUnique.restore();
      userModel.create.restore();
    });

    it('returns 400 if username exists', async () => {
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(userModel, 'isUnique').resolves(false);

      const validatedUser = { data: { username: 'taken' } };
      await authUtils.registerUser(res, validatedUser);

      expect(res.status.calledWith(400)).to.be.true;

      userModel.isUnique.restore();
    });

    it('returns 500 if create returns null', async () => {
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(userModel, 'isUnique').resolves(true);
      sinon.stub(authUtils, 'hashPassword').resolves('hashedpass');
      sinon.stub(userModel, 'create').resolves(null);

      const validatedUser = { data: { username: 'new', password: 'pass' } };
      await authUtils.registerUser(res, validatedUser);

      expect(res.status.calledWith(500)).to.be.true;

      authUtils.hashPassword.restore();
      userModel.isUnique.restore();
      userModel.create.restore();
    });
  });

  describe('authenticateUser', () => {
    it('rejects bad partial user', async () => {
      const req = { body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(authUtils, 'validatePartialUser').resolves({ success: false, error: { errors: [{ message: 'Invalid' }] } });

      await authUtils.authenticateUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;

      authUtils.validatePartialUser.restore();
    });

    it('logs in existing user with correct password', async () => {
      const req = { body: { username: 'user', password: 'pass' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(authUtils, 'validatePartialUser').resolves({ success: true, data: req.body });
      sinon.stub(userModel, 'findOne').resolves([{ username: 'user', password: 'hashed' }]);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(authUtils, 'createAuthTokens').resolves(res);

      await authUtils.authenticateUser(req, res);

      expect(res.json.calledWith({ msg: StatusMessage.LOGIN_SUCCESS })).to.be.true;

      authUtils.validatePartialUser.restore();
      bcrypt.compare.restore();
      userModel.findOne.restore();
      authUtils.createAuthTokens.restore();
    });

    it('blocks login if user has no password', async () => {
      const req = { body: { username: 'user', password: 'pass' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(authUtils, 'validatePartialUser').resolves({ success: true, data: req.body });
      sinon.stub(userModel, 'findOne').resolves([{ username: 'user', password: null }]);

      await authUtils.authenticateUser(req, res);

      expect(res.status.calledWith(403)).to.be.true;

      authUtils.validatePartialUser.restore();
      userModel.findOne.restore();
    });

    it('rejects wrong password', async () => {
      const req = { body: { username: 'user', password: 'wrong' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      sinon.stub(authUtils, 'validatePartialUser').resolves({ success: true, data: req.body });
      sinon.stub(userModel, 'findOne').resolves([{ username: 'user', password: 'hashed' }]);
      sinon.stub(bcrypt, 'compare').resolves(false);

      await authUtils.authenticateUser(req, res);

      expect(res.status.calledWith(403)).to.be.true;

      authUtils.validatePartialUser.restore();
      bcrypt.compare.restore();
      userModel.findOne.restore();
    });
  });
});
