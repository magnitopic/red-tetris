// Third-Party Imports:
import z from 'zod';

// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

const disallowedUsernames = [
    'admin',
    'root',
    'administrator',
    'system',
    'user',
    'guest',
    'support',
    'moderator',
    'superuser',
    'backup',
    'me',
    'blocked-users',
];

const acceptedLanguages = ['en', 'es', 'de'];

const userSchema = z.object({
    username: z
        .string({
            invalid_type_error: 'Invalid username.',
            required_error: 'Username is required.',
        })
        .min(3, 'Username must be at least 3 characters long.')
        .max(30, 'Username must be 30 characters or fewer.')
        .regex(
            /^[a-zA-Z0-9._-]+$/,
            'Username can only contain letters, numbers, underscores, and periods.'
        )
        .refine((username) => !/^[-._]/.test(username), {
            message: 'Username cannot start with a special character.',
        })
        .refine(
            (username) => !disallowedUsernames.includes(username.toLowerCase()),
            {
                message: 'This username is not allowed.',
            }
        ),
    password: z
        .string({
            required_error: 'Password is required.',
        })
        .min(8, 'Password must be at lest 8 characters long.')
        .max(16, 'Password must be 16 characters or fewer.')
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[+.\-_*$@!?%&])(?=.*\d)[A-Za-z\d+.\-_*$@!?%&]+$/,
            { message: StatusMessage.INVALID_PASSWORD }
        ),
    profile_picture_url: z
        .string({
            invalid_type_error: 'Invalid profile picture URL.',
        })
        .url('Profile picture must be a valid URL.')
        .max(2048, 'Profile picture URL must be 2048 characters or fewer.')
        .optional()
        .nullable(),
});

export async function validateUser(input) {
    return userSchema.safeParseAsync(input);
}

export async function validatePartialUser(input) {
    return userSchema.partial().safeParseAsync(input);
}
