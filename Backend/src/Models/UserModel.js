// Local Imports:
import Model from '../Core/Model.js';
import StatusMessage from '../Utils/StatusMessage.js';

class UserModel extends Model {
    constructor() {
        super('users');
    }

    async isUnique(input) {
        const result = await this.findOne(input);
        if (result.length === 0) {
            return true;
        }
        return false;
    }
}

const userModel = new UserModel();
export default userModel;
