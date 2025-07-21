// Third-Party Imports:
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Local Imports:
import userModel from '../Models/UserModel.js';
import getPublicUser from './getPublicUser.js';
import { createAccessToken, createRefreshToken } from './jsonWebTokenUtils.js';
import StatusMessage from './StatusMessage.js';
import { validateUser, validatePartialUser } from '../Schemas/userSchema.js';

export async function checkAuthStatus(req) {
    try {
        const { user } = req.session;
        if (user) {
            const userExist = await userModel.findOne({ id: user.id });
            if (userExist && userExist.length !== 0)
                return { isAuthorized: true, user: user };
        }
        return { isAuthorized: false };
    } catch (error) {
        return { isAuthorized: false };
    }
}

export async function hashPassword(password) {
    const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return encryptedPassword;
}

export function isIgnored(ignoredRoutes, path) {
    return ignoredRoutes.some((pattern) => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
        return regex.test(path);
    });
}

export function setSession(req, accessToken) {
    req.session = { user: null };
    try {
        const { JWT_SECRET_KEY } = process.env;
        const data = jwt.verify(accessToken, JWT_SECRET_KEY);
        req.session.user = data;
    } catch {}
}

export async function createAuthTokens(res, data) {
    const accessToken = createAccessToken(data);
    const refreshToken = createRefreshToken(data);
    const result = await userModel.update({
        input: { refresh_token: refreshToken },
        id: data.id,
    });
    if (!result)
        return res
            .status(500)
            .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
    if (result.length === 0)
        return res.status(400).json({ msg: StatusMessage.USER_NOT_FOUND });

    return res
        .cookie('access_token', accessToken, {
            httpOnly: true, // Cookie only accessible from the server
            secure: process.env.BACKEND_NODE_ENV === 'production', // Only accessible via https
            sameSite: 'strict', // Cookie only accessible from the same domain
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_COOKIE), // Cookie only valid for 1h
        })
        .cookie('refresh_token', refreshToken, {
            httpOnly: true, // Cookie only accessible from the server
            secure: process.env.BACKEND_NODE_ENV === 'production', // Only accessible via https
            sameSite: 'strict', // Cookie only accessible from the same domain
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_COOKIE), // Cookie only valid for 30d
        });
}

export async function registerUser(
    res,
    validatedUser,
    oauth = false,
    autoLogin = false
) {
    const { username, password } = validatedUser.data;
    const isUnique = await userModel.isUnique({ username });
    if (isUnique) {
        // Encrypt password
        if (!oauth) validatedUser.data.password = await hashPassword(password);

        const { location } = validatedUser.data;
        delete validatedUser.data.location;

        const user = await userModel.create({ input: validatedUser.data });
        if (user === null) {
            return res
                .status(500)
                .json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
        } else if (user.length === 0) {
            return res
                .status(400)
                .json({ error: StatusMessage.USER_NOT_FOUND });
        }

        // Create auth tokens if OAuth or autoLogin is requested
        if (oauth || autoLogin) {
            await createAuthTokens(res, user);
            if (!('set-cookie' in res.getHeaders())) return res;
        }

        // If autoLogin is true, return login success message instead of user data
        if (autoLogin) {
            return res.status(201).json({ msg: StatusMessage.LOGIN_SUCCESS });
        }

        // Returns public user info (original behavior):
        const publicUser = await getPublicUser(user);
        if (!publicUser)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        return res.status(201).json({ msg: publicUser });
    }

    return res.status(400).json({ msg: StatusMessage.DUPLICATE_USERNAME });
}

export async function authenticateUser(req, res) {
    try {
        // Check if we have username and password
        const partialValidation = await validatePartialUser(req.body);
        if (!partialValidation.success) {
            const errorMessage = partialValidation.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        const { username, password } = partialValidation.data;

        // Check if user exists
        const existingUser = await userModel.findOne({ username });

        if (existingUser && existingUser.length !== 0) {
            // User exists - perform login
            if (!existingUser.password)
                return res
                    .status(403)
                    .json({ msg: StatusMessage.CANNOT_LOGIN_WITH_PASS });

            // Validate password
            const isValidPassword = await bcrypt.compare(
                password,
                existingUser.password
            );
            if (!isValidPassword)
                return res
                    .status(401)
                    .json({ msg: StatusMessage.WRONG_PASSWORD });

            await createAuthTokens(res, existingUser);
            if (!('set-cookie' in res.getHeaders())) return res;

            return res.json({ msg: StatusMessage.LOGIN_SUCCESS });
        } else {
            // User doesn't exist - perform registration with auto-login
            const fullValidation = await validateUser(req.body);
            if (!fullValidation.success) {
                const errorMessage = fullValidation.error.errors[0].message;
                return res.status(400).json({ msg: errorMessage });
            }

            return await registerUser(res, fullValidation, false, true);
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res
            .status(500)
            .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
    }
}
