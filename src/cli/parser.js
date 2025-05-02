export const EXIT_COMMAND = '.exit';

/**
 * Parse a command string into command and arguments, handling quoted values.
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

  // For all other commands, use regex to match arguments:
  // 1. Double quoted strings: "([^"]*)"
  // 2. Single quoted strings: '([^']*)'
  // 3. Non-whitespace sequences: (\S+)
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  const parts = [];
  let match;

  while ((match = regex.exec(trimmedInput)) !== null) {
    // Add the captured group that's not undefined
    // match[1] for double quotes, match[2] for single, match[3] for non-space
    parts.push(match[1] || match[2] || match[3]);
  }

  if (parts.length === 0) {
    return { command: '', args: [] };
  }

  const command = parts[0];
  const args = parts.slice(1);

  return { command, args };
}

/**
 * Extracts username from command line arguments.
 * Prioritizes the npm config environment variable, then checks node process.argv.
 * @returns {string} Username or 'Anonymous' if not found or empty.
 */
export function extractUsername() {
  let username = process.env.npm_config_username;

  if (!username) {
    const args = process.argv.slice(2);
    const usernameArg = args.find(arg => arg.startsWith('--username='));
    if (usernameArg) {
      username = usernameArg.split('=')[1];
    }
  }

  return username ? username : 'Anonymous';
}

const ALLOWED_ARG_PREFIXES = ['--username='];
const ALLOWED_ARGS_MESSAGE = `Allowed arguments: ${ALLOWED_ARG_PREFIXES.map(p => `${p}<value>`).join(', ')}`;

/**
 * Validates command line arguments passed to the script entry point.
 * Exits if the invalid argument is found.
 */
export function validateArgs() {
  const args = process.argv.slice(2);
  const invalidArgs = args.filter(arg => !ALLOWED_ARG_PREFIXES.some(prefix => arg.startsWith(prefix)));

  if (invalidArgs.length > 0) {
    console.error(`Invalid argument(s): ${invalidArgs.join(', ')}`);
    console.error(ALLOWED_ARGS_MESSAGE);
    process.exit(1);
  }
}
