import { readdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { resolvePath, getCurrentDriveRoot, isDirectory } from '../utils/pathUtils.js';

/**
 * Navigate up one directory
 * @param {Array} args - Command arguments (none expected)
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function up(args, getSetCurrentDir) {
  if (args.length > 0) {
    throw new Error("The 'up' command does not accept arguments");
  }
  const currentDir = await getSetCurrentDir();
  if (getCurrentDriveRoot(currentDir) === currentDir) {
    return;
  }
  const parentDir = join(currentDir, '..');
  await getSetCurrentDir(parentDir);
}

/**
 * Change to specified directory
 * @param {Array} args - Command arguments, expects directory path
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function cd(args, getSetCurrentDir) {
  if (!args.length) {
    throw new Error('Directory path required');
  }
  const currentDir = await getSetCurrentDir();
  const targetPath = resolvePath(args[0], currentDir);

  if (!(await isDirectory(targetPath))) {
    throw new Error(`'${args[0]}' is not a directory or does not exist`);
  }

  const normalizedPath = normalize(targetPath);

  await getSetCurrentDir(normalizedPath);
}

/**
 * List contents of current directory
 * @param {Array} args - Command arguments (none expected)
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function ls(args, getSetCurrentDir) {
  if (args.length > 0) {
    throw new Error("The 'ls' command does not accept arguments");
  }
  const currentDir = await getSetCurrentDir();
  try {
    const entries = await readdir(currentDir, { withFileTypes: true });
    const sortedEntries = entries
      .map(e => ({ Name: e.name, Type: e.isDirectory() ? 'directory' : 'file' }))
      .sort((a, b) => a.Type.localeCompare(b.Type) || a.Name.localeCompare(b.Name));

    if (sortedEntries.length === 0) {
      console.log('(empty directory)');
    } else {
      console.table(sortedEntries);
    }
    console.log('');

  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}
