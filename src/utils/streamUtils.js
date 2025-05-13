import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';

/**
 * Copy a file using streams
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<void>}
 */
export async function copyFileWithStreams(source, destination) {
  try {
    await pipeline(
      createReadStream(source),
      createWriteStream(destination)
    );
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * Read file and write to output stream
 * @param {string} filePath - Path to file to read
 * @param {stream.Writable} outputStream - Output stream (typically process.stdout)
 * @returns {Promise<void>}
 */
export async function readFileToStream(filePath, outputStream) {
  try {
    await pipeline(
      createReadStream(filePath),
      outputStream,
      { end: false }
    );
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Compress a file using Brotli algorithm
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<void>}
 */
export async function compressFile(source, destination) {
  try {
    await pipeline(
      createReadStream(source),
      createBrotliCompress(),
      createWriteStream(destination)
    );
  } catch (error) {
    throw new Error(`Failed to compress file: ${error.message}`);
  }
}

/**
 * Decompress a file using Brotli algorithm
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<void>}
 */
export async function decompressFile(source, destination) {
  try {
    await pipeline(
      createReadStream(source),
      createBrotliDecompress(),
      createWriteStream(destination)
    );
  } catch (error) {
    throw new Error(`Failed to decompress file: ${error.message}`);
  }
}
