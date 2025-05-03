import { resolvePath, isFile, ensurePathDoesNotExist } from '../utils/pathUtils.js';
import { compressFile, decompressFile } from '../utils/streamUtils.js';
import { dirname } from 'node:path';
import { mkdir, unlink } from 'node:fs/promises';

/**
 * Compress a file using Brotli algorithm
 * @param {Array} args - Command arguments, expects [path_to_file path_to_destination]
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function compress(args, getSetCurrentDir) {
  if (args.length !== 2) {
    throw new Error("Invalid input. 'compress' command requires two parameters: (path_to_file path_to_destination)");
  }

  const currentDir = await getSetCurrentDir();
  const sourcePath = resolvePath(args[0], currentDir);
  const destPath = resolvePath(args[1], currentDir);

  if (!(await isFile(sourcePath))) {
    throw new Error(`Source file does not exist or is not a file: ${sourcePath}`);
  }

  await ensurePathDoesNotExist(destPath, 'compress');

  try {
    await mkdir(dirname(destPath), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create destination directory: ${error.message}`);
    }
  }

  try {
    await compressFile(sourcePath, destPath);
    console.log(`File compressed successfully to ${destPath}`);
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
}

/**
 * Decompress a file using Brotli algorithm
 * @param {Array} args - Command arguments, expects [path_to_file path_to_destination]
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function decompress(args, getSetCurrentDir) {
  if (args.length !== 2) {
    throw new Error("Invalid input. 'decompress' command requires two parameters: (path_to_file path_to_destination)");
  }

  const currentDir = await getSetCurrentDir();
  const sourcePath = resolvePath(args[0], currentDir);
  const destPath = resolvePath(args[1], currentDir);

  if (!(await isFile(sourcePath))) {
    throw new Error(`Source file does not exist or is not a file: ${sourcePath}`);
  }

  await ensurePathDoesNotExist(destPath, 'decompress');

  try {
    await mkdir(dirname(destPath), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create destination directory: ${error.message}`);
    }
  }

  try {
    await decompressFile(sourcePath, destPath);
    console.log(`File decompressed successfully to ${destPath}`);
  } catch (error) {
    await unlink(destPath);
    throw new Error(`Decompression failed: ${error.message}`);
  }
}
