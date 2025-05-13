import { isAbsolute, join, parse } from 'node:path';
import { platform } from 'node:process';
import { stat, access } from 'node:fs/promises';

const POSIX_ROOT = '/';

/**
 * Get current drive root on Windows, or filesystem root on POSIX
 * @param {string} path - Path to extract root from
 * @returns {string} The root directory
 */
export function getCurrentDriveRoot(path) {
  if (platform === 'win32') {
    // On Windows, get the drive letter
    const driveRoot = parse(path).root;
    return driveRoot;
  } else {
    return POSIX_ROOT;
  }
}

/**
 * Resolve path relative to current directory, or absolute
 * @param {string} path - Path to resolve
 * @param {string} currentDir - Current working directory
 * @returns {string} Resolved path
 */
export function resolvePath(path, currentDir) {
  // Handle Windows drive switching ('d:' or 'd:\')
  if (platform === 'win32' && /^[a-zA-Z]:(?:\\)?$/.test(path)) {
    // If just a drive letter ('d:'), append root slash
    if (path.length === 2) {
      return `${path}\\`;
    }
    return path;
  }

  if (isAbsolute(path)) {
    return path;
  } else {
    return join(currentDir, path);
  }
}

/**
 * Check if path exists and is a directory
 * @param {string} path - Path to check
 * @returns {Promise<boolean>} True if path is a directory
 */
export async function isDirectory(path) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Check if path exists and is a file
 * @param {string} path - Path to check
 * @returns {Promise<boolean>} True if path is a file
 */
export async function isFile(path) {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}


/**
 * Ensures that a given path does not already exist.
 * Throws an error if the path exists or if an unexpected error occurs during check.
 * @param {string} pathToCheck - The absolute path to check.
 * @param {string} operationName - Name of the operation (e.g., 'rename', 'copy') for error messages.
 * @returns {Promise<void>}
 */
export async function ensurePathDoesNotExist(pathToCheck, operationName = 'operation') {
  try {
    await access(pathToCheck);
    throw new Error(`Cannot perform ${operationName}: target '${pathToCheck}' already exists.`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}
