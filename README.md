# File Manager

A Node.js command-line File Manager that allows you to perform basic file operations, get system information, calculate file hashes, and compress/decompress files.

## Requirements

- Node.js version 22.14.0 or higher
- No external dependencies

## Installation

1. Clone this repository
2. Navigate to the project directory

## Usage

Start the application with your username:

```bash
npm run start -- --username=your_username
```

## Available Commands

### Navigation & Working Directory

- Go up one directory:
  ```
  up
  ```

- Change directory:
  ```
  cd path_to_directory
  ```

- List files and directories in current directory:
  ```
  ls
  ```

### File Operations

- Read file content:
  ```
  cat path_to_file
  ```

- Create empty file:
  ```
  add new_file_name
  ```

- Create new directory:
  ```
  mkdir new_directory_name
  ```

- Rename file:
  ```
  rn path_to_file new_filename
  ```

- Copy file:
  ```
  cp path_to_file path_to_new_directory
  ```

- Move file:
  ```
  mv path_to_file path_to_new_directory
  ```

- Delete file:
  ```
  rm path_to_file
  ```

### Operating System Information

- Get End-Of-Line (EOL) character:
  ```
  os --EOL
  ```

- Get CPU information:
  ```
  os --cpus
  ```

- Get home directory:
  ```
  os --homedir
  ```

- Get current system username:
  ```
  os --username
  ```

- Get CPU architecture:
  ```
  os --architecture
  ```

### Hash Calculation

- Calculate file hash (SHA-256):
  ```
  hash path_to_file
  ```

### Compression Operations

- Compress file using Brotli algorithm:
  ```
  compress path_to_file path_to_destination
  ```

- Decompress file:
  ```
  decompress path_to_file path_to_destination
  ```

## Exiting the Application

You can exit the application using:

- Press Ctrl+C
- Type `.exit` command
