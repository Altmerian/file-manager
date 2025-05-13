import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolvePath, isFile } from '../utils/pathUtils.js';

/**
 * Calculate hash for a file
 * @param {Array} args - Command arguments, expects file path
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function calculateHash(args, getSetCurrentDir) {
  if (args.length !== 1) {
    throw new Error("Invalid input. 'hash' command requires a single parameter (path_to_file)");
  }

  const currentDir = await getSetCurrentDir();
  const filePath = resolvePath(args[0], currentDir);

  if (!(await isFile(filePath))) {
    throw new Error(`Not a file or does not exist: ${filePath}`);
  }

  try {
    const hash = createHash('sha256');
    const readStream = createReadStream(filePath);

    await pipeline(
      readStream,
      hash
    );

    console.log(`Hash (SHA-256): ${hash.digest('hex')}`);
  } catch (error) {
    throw new Error(`Failed to calculate hash for ${filePath}: ${error.message}`);
  }
}
