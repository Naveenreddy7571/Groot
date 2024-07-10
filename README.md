# Groot: A Custom Git Software Implementation

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction
Groot is a custom version control system implemented in JavaScript, designed to help users understand the internals of Git by providing core functionalities such as adding files to the staging area, committing files, viewing commit logs, and checking commit differences.

## Features
- **Add Files to Staging Area:** Easily add files to the staging area.
- **Commit Files:** Commit files from the staging area to the repository.
- **Groot Log:** View a log of all commits.
- **Groot Diff:** Check differences between commits.
- **User-Friendly Interface:** Developed with JavaScript for ease of use.

## Installation
To get started with Groot, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/YourUsername/Groot.git
    ```

2. Navigate to the project directory:
    ```bash
    cd Groot
    ```

3. Install the required dependencies:
    ```bash
    npm install
    ```

## Usage
### Adding Files to Staging Area
```bash
node groot.js
create object
obj.add(<FileName>)

```

### commiting Files from Staging Area
```bash
node groot.js
obj.commit(<FileName>)

```

### show commit log

```bash
obj.log()
```

### show commits diffrence

```bash
obj.showCommitDiff(<commit hash>)
```





