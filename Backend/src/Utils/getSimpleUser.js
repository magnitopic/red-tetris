export default async function getSimpleUser(user) {
    const { API_HOST, API_PORT, API_VERSION } = process.env;

    const profilePicture = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${user.id}/profile-picture`;

    const simpleUser = {
        id: user.id,
        username: user.username,
        profile_picture: profilePicture,
    };

    return simpleUser;
}
