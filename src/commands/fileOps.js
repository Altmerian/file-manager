import { stdout } from 'node:process';
import { mkdir, writeFile, rename, unlink, access } from 'node:fs/promises';
import { readFileToStream, copyFileWithStreams } from '../utils/streamUtils.js';
import { resolvePath, isFile, isDirectory, ensurePathDoesNotExist } from '../utils/pathUtils.js';
import { dirname } from 'node:path';

/**
 * Display contents of a file
 * @param {Array} args - Command arguments, expects file path
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function cat(args, getSetCurrentDir) {
  if (args.length !== 1) {
    throw new Error("Invalid input: 'cat' command expects exactly one argument (file path)");
  }

  const currentDir = await getSetCurrentDir();
  const filePath = resolvePath(args[0], currentDir);

  if (!(await isFile(filePath))) {
    throw new Error(`${filePath} is not a file or does not exist`);
  }

  await readFileToStream(filePath, stdout);
  console.log('');
}

/**
 * Create an empty file
 * @param {Array} args - Command arguments, expects file name
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function add(args, getSetCurrentDir) {
  if (args.length !== 1) {
    throw new Error("Invalid input: 'add' command expects exactly one argument (new file name)");
  }
  const currentDir = await getSetCurrentDir();
  const filePath = resolvePath(args[0], currentDir);

  try {
    await writeFile(filePath, '', { flag: 'wx' });
    console.log(`File '${filePath}' created successfully.`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error('File already exists');
    } else {
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }
}

/**
 * Create a new directory
 * @param {Array} args - Command arguments, expects directory name
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function makeDirectory(args, getSetCurrentDir) {
  if (args.length !== 1) {
    throw new Error("Invalid input: 'mkdir' command expects exactly one argument (new directory name)");
  }

  const currentDir = await getSetCurrentDir();
  const dirPath = resolvePath(args[0], currentDir);

  try {
    await mkdir(dirPath);
    console.log(`Directory '${dirPath}' created successfully.`);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error('Directory already exists');
    } else {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }
}

/**
 * Rename a file
 * @param {Array} args - Command arguments, expects [oldPath, newName]
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function renameFile(args, getSetCurrentDir) {
  if (args.length !== 2) {
    throw new Error("Invalid input: 'rn' command expects exactly two arguments (path_to_file new_filename)");
  }

  const currentDir = await getSetCurrentDir();
  const oldPath = resolvePath(args[0], currentDir);
  const oldDir = dirname(oldPath);
  const newPath = resolvePath(args[1], oldDir);

  if (!(await isFile(oldPath))) {
    throw new Error(`Source file does not exist or is not a file: ${oldPath}`);
  }

  await ensurePathDoesNotExist(newPath, 'rename');

  try {
    await rename(oldPath, newPath);
    console.log(`File '${oldPath}' successfully renamed to '${newPath}'`);
  } catch (error) {
    throw new Error(`Failed to rename file: ${error.message}`);
  }
}

/**
 * Copy a file
 * @param {Array} args - Command arguments, expects [sourcePath, destinationDir]
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function copyFile(args, getSetCurrentDir) {
  if (args.length !== 2) {
    throw new Error("Invalid input: 'cp' command expects exactly two arguments (path_to_file path_to_new_directory)");
  }

  const currentDir = await getSetCurrentDir();
  const sourcePath = resolvePath(args[0], currentDir);
  const destDirPath = resolvePath(args[1], currentDir);

  if (!(await isFile(sourcePath))) {
    throw new Error('Source file does not exist or is not a file');
  }

  if (!(await isDirectory(destDirPath))) {
    throw new Error('Destination directory does not exist or is not a directory');
  }

  const sourceFileName = sourcePath.split(/[\/\\]/).pop();
  const destFilePath = resolvePath(sourceFileName, destDirPath);

  await ensurePathDoesNotExist(destFilePath, 'copy');

  try {
    await copyFileWithStreams(sourcePath, destFilePath);
    console.log(`File '${sourcePath}' successfully copied to '${destFilePath}'`);
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * Move a file (copy + delete)
 * @param {Array} args - Command arguments, expects [sourcePath, destinationDir]
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function moveFile(args, getSetCurrentDir) {
  // Validate arguments
  if (args.length < 2) {
    throw new Error('Both source file and destination directory are required');
  }

  // Get current directory and resolve paths
  const currentDir = await getSetCurrentDir();
  const sourcePath = resolvePath(args[0], currentDir);
  const destDirPath = resolvePath(args[1], currentDir);

  // Check if source file exists
  if (!(await isFile(sourcePath))) {
    throw new Error(`Source file does not exist or is not a file: ${sourcePath}`);
  }

  // Check if destination directory exists
  if (!(await isDirectory(destDirPath))) {
    throw new Error(`Destination directory does not exist or is not a directory: ${destDirPath}`);
  }

  // Create destination file path (same filename in new directory)
  const sourceFileName = sourcePath.split(/[/\\]/).pop();
  const destFilePath = resolvePath(sourceFileName, destDirPath);

  // Copy file using streams
  try {
    await copyFileWithStreams(sourcePath, destFilePath);

    // After successful copy, delete the source file
    await unlink(sourcePath);
  } catch (error) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

/**
 * Remove a file
 * @param {Array} args - Command arguments, expects file path
 * @param {function} getSetCurrentDir - Function to get and set current directory
 * @returns {Promise<void>}
 */
export async function removeFile(args, getSetCurrentDir) {
  // Validate arguments
  if (!args.length) {
    throw new Error('File path required');
  }

  // Get current directory and resolve file path
  const currentDir = await getSetCurrentDir();
  const filePath = resolvePath(args[0], currentDir);

  // Check if file exists
  if (!(await isFile(filePath))) {
    throw new Error('Not a file or does not exist');
  }

  // Delete file
  try {
    await unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
