import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import { createFolder, createFile, returnFileContent } from './fileMaker.js';

const program = new Command();

const promptUserForProjectDetails = async () => {
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: input => input ? true : 'Project name is required.'
    },
    {
      type: 'confirm',
      name: 'addDescription',
      message: 'Do you want to add a description?',
      default: false
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      when: answers => answers.addDescription
    },
    {
      type: 'confirm',
      name: 'addAuthor',
      message: 'Do you want to add an author name?',
      default: false
    },
    {
      type: 'input',
      name: 'author',
      message: 'Project author:',
      when: answers => answers.addAuthor
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: ['commonjs', 'module']
    },
    {
      type: 'list',
      name: 'structureType',
      message: 'Choose folder structure setup:',
      choices: ['Default structure', 'Custom structure']
    },
    {
      type: 'list',
      name: 'database',
      message: 'Choose a database:',
      choices: ['MongoDB', 'PostgreSQL', 'MySQL', 'None']
    },
    {
      type: 'confirm',
      name: 'dockerSupport',
      message: 'Do you want to add Docker support?',
      default: false
    }
  ]);
};

const createProjectFolders = async (answers, projectRoot) => {
  let folders = ['routes', 'controllers', 'daos', 'models', 'middleware', 'configurations'];

  if (answers.structureType === 'Custom structure') {
    const { customFolders } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customFolders',
        message: 'Enter folder names separated by commas:',
        filter: input => input.split(',').map(f => f.trim()).filter(f => f)
      }
    ]);
    folders = customFolders;
  }

  folders.forEach(folder => createFolder(path.join(projectRoot, folder)));
  return folders;
};

// Generate files for specific folders
const generateFilesForFolders = (folders, answers, projectRoot) => {
  const fileMap = {
    controllers: ['controller.js'],
    daos: ['dao.js'],
    models: ['model.js'],
    middleware: ['middleware.js'],
    routes: ['router.js'],
    configurations: ['dbConfig.js']
  };

  folders.forEach(folder => {
    if (fileMap[folder]) {
      fileMap[folder].forEach(file => {
        createFile(path.join(projectRoot, folder), file, returnFileContent(file, answers));
      });
    }
  });
};

// Create base files like package.json, index.js, .env, etc.
const createBaseFiles = (answers, projectRoot) => {
  const baseFiles = [
    ['package.json', returnFileContent('package.json', answers)],
    ['index.js', returnFileContent('index.js', answers)],
    ['.env', returnFileContent('.env', answers)],
    ['README.md', returnFileContent('README.md', answers)],
    ['.gitignore', returnFileContent('.gitignore', answers)]
  ];

  baseFiles.forEach(([file, content]) => {
    createFile(projectRoot, file, content);
  });
};

const addDockerFiles = (answers, projectRoot) => {
  if (answers.dockerSupport) {
    createFile(projectRoot, 'Dockerfile', returnFileContent('Dockerfile', answers));
    createFile(projectRoot, 'docker-compose.yml', returnFileContent('docker-compose.yml', answers));
  }
};

program
  .name('create-backend-project')
  .description('Quick setup for Node.js backend projects')
  .version('1.0.0')
  .action(async () => {
    try {
      const answers = await promptUserForProjectDetails();
      delete answers.addDescription;
      delete answers.addAuthor;

      const projectRoot = path.resolve(answers.name);
      if (createFolder(projectRoot)) {
        console.error('Folder already exists. Please choose a different name.');
        process.exit(1);
      }

      const folders = await createProjectFolders(answers, projectRoot);
      generateFilesForFolders(folders, answers, projectRoot);
      createBaseFiles(answers, projectRoot);
      addDockerFiles(answers, projectRoot);

      console.log(`\nProject "${answers.name}" is ready!`);
      console.log(`\nNext steps:\ncd ${answers.name}\nnpm install\n`);
    } catch (error) {
      console.error(error.message);
    }
  });

program.parse(process.argv);
