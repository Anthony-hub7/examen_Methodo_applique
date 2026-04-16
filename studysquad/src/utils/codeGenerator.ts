// ======================================
// CODE GENERATOR - Generate invitation codes for groups
// ======================================

/**
 * Generate a random alphanumeric code for group invitations
 * @param length - Length of the code (default: 6)
 * @returns A random code string (uppercase)
 */
export const codeGenerator = (length: number = 6): string => {
  // Characters to use: avoid confusing characters (0/O, 1/l/I)
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    code += characters[randomIndex]
  }

  return code
}

/**
 * Generate a UUID-like code (32 characters)
 * @returns A random UUID-v4-like string
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a short ID (8 characters)
 * @returns A random short ID
 */
export const generateShortId = (): string => {
  return codeGenerator(8)
}
