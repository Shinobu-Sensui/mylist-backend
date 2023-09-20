import bcrypt from 'bcrypt';
import { PasswordHashingError } from '../error/passwordHashingError.js';
import { PasswordVerifyError } from '../error/passwordVerifyError.js';

const saltRounds = 10; 

type HashPassword = (password: string) => Promise<string>
type VerifyPassword = (password: string, hashedPassword: string) => Promise<boolean>

/**
 * Hashes a password.
 *
 * @param password - The password to hash.
 * @returns The hashed password.
 * @throws {PasswordHashingError}
 */
const hashPassword: HashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new PasswordHashingError(`Failed to hash password: ${error.message}`)
        }
        throw error
    }
}

/**
 * Verifies a password against a hashed password.
 *
 * @param password - The plain text password to verify.
 * @param hashedPassword - The hashed password to verify against.
 * @returns Whether the password is a match.
 * @throws {PasswordVerifyError}
 */
const verifyPassword: VerifyPassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword)
        return match
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new PasswordVerifyError(`Failed to verify password: ${error.message}`)
        }
        throw error   
    }
}

export {
    hashPassword,
    verifyPassword
}
