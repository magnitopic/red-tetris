// Third-Party Imports:
import jwt from 'jsonwebtoken';

function createJWT(data, expiry) {
    const { JWT_SECRET_KEY } = process.env;
    const token = jwt.sign(data, JWT_SECRET_KEY, { expiresIn: expiry });
    return token;
}

export function createAccessToken(user) {
    const { ACCESS_TOKEN_EXPIRY } = process.env;
    const data = {
        id: user.id,
        username: user.username,
        oauth: user.oauth ?? false,
    };
    const accessToken = createJWT(data, ACCESS_TOKEN_EXPIRY);

    return accessToken;
}

export function createRefreshToken(user) {
    const { REFRESH_TOKEN_EXPIRY } = process.env;
    const data = {
        id: user.id,
        username: user.username,
        oauth: user.oauth ?? false,
    };
    const refreshToken = createJWT(data, REFRESH_TOKEN_EXPIRY);

    return refreshToken;
}
