import { isAbsolute, join, parse } from 'node:path';
import { platform } from 'node:process';
import { stat } from 'node:fs/promises';

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
    return false;
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
    return false;
  }
}
