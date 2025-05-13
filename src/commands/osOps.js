import os from 'node:os';
import { arch } from 'node:process';

/**
 * Handle OS information commands
 * @param {Array} args - Command arguments, expects single '--parameter' option
 * @param {function} getSetCurrentDir - Function to get and set current directory (not used in this command)
 * @returns {Promise<void>}
 */
export async function osCommand(args, getSetCurrentDir) {
  if (args.length !== 1) {
    throw new Error("Invalid input. 'os' command requires a single parameter (--EOL, --cpus, --homedir, --username, --architecture)");
  }

  const parameter = args[0];

  switch (parameter) {
    case '--EOL':
      // Get EOL (default system End-Of-Line)
      console.log(`System EOL: ${JSON.stringify(os.EOL)}`);
      break;

    case '--cpus':
      // Get host machine CPUs info
      const cpus = os.cpus();
      console.log(`Total CPUs: ${cpus.length}`);
      console.log('CPU Details:');
      cpus.forEach((cpu, index) => {
        console.log(`CPU ${index + 1}: ${cpu.model} (${cpu.speed / 1000} GHz)`);
      });
      break;

    case '--homedir':
      // Get home directory
      console.log(`Home Directory: ${os.homedir()}`);
      break;

    case '--username':
      // Get current system user name
      console.log(`System Username: ${os.userInfo().username}`);
      break;

    case '--architecture':
      // Get CPU architecture
      console.log(`CPU Architecture: ${arch}`);
      break;

    default:
      throw new Error("Invalid 'os' parameter. Use --EOL, --cpus, --homedir, --username, or --architecture");
  }
}
