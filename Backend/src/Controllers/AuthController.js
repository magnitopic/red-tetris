// Third-Party Imports:
import jwt from 'jsonwebtoken';

// Local Imports:
import userModel from '../Models/UserModel.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import { validateUser } from '../Schemas/userSchema.js';
import {
    validatePasswords,
    validatePartialPasswords,
} from '../Schemas/changePasswordSchema.js';
import StatusMessage from '../Utils/StatusMessage.js';
import {
    checkAuthStatus,
    hashPassword,
    createAuthTokens,
    registerUser,
} from '../Utils/authUtils.js';
import {
    confirmAccountValidations,
    loginValidations,
} from '../Validations/authValidations.js';

export default class AuthController {
    static async login(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        // Validations
        const { user } = await loginValidations(req.body, res);
        if (!user) return res;

        // Create JWT
        await createAuthTokens(res, user);
        if (!('set-cookie' in res.getHeaders())) return res;

        return res.json({ msg: StatusMessage.LOGIN_SUCCESS });
    }

    static async register(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        // Validate and clean input
        let validatedUser = await validateUser(req.body);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        return await registerUser(res, validatedUser);
    }

    static async logout(req, res) {
        return res
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .json({ msg: StatusMessage.LOGOUT_SUCCESS });
    }

    static async status(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized) {
            delete authStatus.user.iat;
            delete authStatus.user.exp;
            return res.status(200).json({ msg: authStatus.user });
        }
        return res.status(401).json();
    }

    static async confirm(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        try {
            const { JWT_SECRET_KEY } = process.env;
            const confirmationToken = req.query.token;
            const tokenData = jwt.verify(confirmationToken, JWT_SECRET_KEY);

            // Validations
            const validationResult = await confirmAccountValidations(
                res,
                tokenData
            );
            if (!validationResult) return res;

            const result = await userModel.update({
                input: { active_account: true },
                id: tokenData.id,
            });
            if (!result)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            if (result.length === 0)
                return res
                    .status(400)
                    .json({ msg: StatusMessage.USER_NOT_FOUND });

            await createAuthTokens(res, tokenData);
            if (!('set-cookie' in res.getHeaders())) return res;

            return res.json({ msg: StatusMessage.ACC_SUCCESSFULLY_CONFIRMED });
        } catch (error) {
            console.error('ERROR:', error);
            if (error.name === 'TokenExpiredError') {
                const confirmationToken = req.query.token;
                const tokenData = jwt.decode(confirmationToken);

                const user = await userModel.findOne({ id: tokenData.id });
                if (!user)
                    return res
                        .status(500)
                        .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
                if (user.length === 0)
                    return res
                        .status(400)
                        .json({ msg: StatusMessage.USER_NOT_FOUND });
            }
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
        }
    }
}
