export const EXIT_COMMAND = '.exit';

/**
 * Parse a command string into command and arguments
 * @param {string} input - User input string
 * @returns {Object} Object with command and args properties
 */
export function parseCommand(input) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { command: '', args: [] };
  }

  if (trimmedInput === EXIT_COMMAND) {
    return { command: EXIT_COMMAND, args: [] };
  }

  // Special case for OS commands that use --parameter format
  if (trimmedInput.startsWith('os --')) {
    const parameter = trimmedInput.split('--')[1];
    return { command: 'os', args: [`--${parameter}`] };
  }

  const parts = trimmedInput.split(' ');
  const command = parts[0];
  const args = parts.slice(1).filter(arg => arg !== '');

  return { command, args };
}

/**
 * Extracts username from the npm script argument `--username`
 * @returns {string} Username from npm script argument or 'Anonymous'
 */
export function extractUsername() {
  return process.env.npm_config_username || 'Anonymous';
}
