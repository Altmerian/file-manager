import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Create a readline interface for user input
 * @returns {readline.Interface} Readline interface
 */
export function createInterface() {
  return readline.createInterface({
    input,
    output,
  });
}

/**
 * Display the current working directory
 * @param {string} currentDir - Current working directory
 */
export function displayCurrentDirectory(currentDir) {
  console.log(`You are currently in ${currentDir}`);
}

/**
 * Display welcome message
 * @param {string} username - User's name from command line args
 */
export function displayWelcome(username) {
  console.log(`Welcome to the File Manager, ${username}!`);
}

/**
 * Display goodbye message
 * @param {string} username - User's name from command line args
 */
export function displayGoodbye(username) {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
}
