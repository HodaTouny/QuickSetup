import fs from "fs";
import path from "path";
import beautify from "js-beautify";


function beautifyContent(content) {
    return beautify(content, { indent_size: 2, space_in_empty_paren: true });
}

function createFolder(folderName) {
    const exists = fs.existsSync(folderName);
    if (!exists) {
        fs.mkdirSync(folderName, { recursive: true });
    }
    return exists;
}

function createFile( folderPath,filename, content) {
    const filePath = path.join(folderPath, filename);

    if (fs.existsSync(filePath)) {
        throw new Error("File already exists");
    }

    fs.writeFileSync(filePath, content);
    return "File created successfully";
}



function generatePackageJson({ description, author, type, name, database }) {
  const dependencies = {
      express: "^4.18.2",
      nodemon: "^3.0.1",
      dotenv: "^16.0.0"
  };

  if (database === "MongoDB") {
      dependencies["mongoose"] = "^6.0.0";  
  } else if (database === "PostgreSQL") {
      dependencies["pg"] = "^8.7.1";  
  } else if (database === "MySQL") {
      dependencies["mysql2"] = "^2.3.0";  
  }

  return JSON.stringify({
      name: name || "my-project",
      version: "1.0.0",
      description: description || "",
      main: "index.js",
      scripts: {
          test: "echo \"Error: no test specified\" && exit 1",
          dev: "nodemon index.js"
      },
      keywords: [],
      author: author || "",
      license: "ISC",
      type: type || "commonjs",
      dependencies: dependencies
  }, null, 2);
}

function generateIndexJs(type) {
    if (type === "module") {
        return `import express from 'express';
import dotenv from 'dotenv';
import router from './routes/router.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(router);

app.use('*', (req, res) => res.status(404).send("Route not found"));

app.listen(process.env.PORT || 3001, () => {
    console.log('Server started on port', process.env.PORT || 3001);
});`;

    } else {
        return `const express = require('express');
                const dotenv = require('dotenv');
                const router = require('./routes/router');
                const {db} = require('./configurations/db');

                dotenv.config();

                const app = express();
                app.use(express.json());
                app.use(router);

                app.use('*', (req, res) => res.status(404).send("Route not found"));

                app.listen(process.env.PORT || 3001, () => {
                    console.log('Server started on port', process.env.PORT || 3001);
                });`;
    }
}

function generateRouterJs(type) {
    if (type === "module") {
        return `import express from 'express';
                import controller from '../controllers/controller.js';
                import middleware from '../middleware/middleware.js';

                const router = express.Router();

                router.use(middleware);
                router.get('/', controller.demo);

                export default router;`;
                    } else {
                        return `const express = require('express');
                const controller = require('../controllers/controller');
                const middleware = require('../middleware/middleware');

                const router = express.Router();

                router.use(middleware);
                router.get('/', controller.demo);

                module.exports = router;`;
    }
}

function generateControllerJs(type) {
    if (type === "module") {
        return `import dao from '../dao/dao.js';
                function demo(req, res) {
                    res.send("Demo response from controller.");
                }

                export default { demo };`;
                    } else {
                        return `const dao = require('../dao/dao');
                function demo(req, res) {
                    res.send("Demo response from controller.");
                }

                module.exports = { demo };`;
    }
}

function generateDaoJs(type) {
    return `// DAO (Data Access Object) for interacting with database
            async function getSampleData() {
                // Replace with DB query logic
                return [{ id: 1, name: "Sample" }];
            }

            export default { getSampleData };`;
}

function generateModelJs(type) {
    return `// Example model schema using mongoose
            // const mongoose = require('mongoose');
            // const Schema = mongoose.Schema;

            // const SampleSchema = new Schema({
            //     name: { type: String, required: true }
            // });

            // module.exports = mongoose.model('Sample', SampleSchema);`;
}

function generateMiddlewareJs(type) {
    if (type === "module") {
        return `const middleware = (req, res, next) => {
                console.log("Request received:", req.method, req.url);
                next();
            };

            export default middleware;`;
    } else {
        return `const middleware = (req, res, next) => {
                console.log("Request received:", req.method, req.url);
                next();
            };

            module.exports = middleware;`;
    }
}

function generateEnv() {
    return `PORT=5000
            DB_URL=your_database_url`;
}


function generateReadme(name) {
    return `# ${name || "My Project"}
            ## Description
            Starter backend project using Node.js and Express.

            ## Setup
            \`\`\`bash
            npm install
            npm run dev
            \`\`\`

            ## Folder Structure
            - \`routes\`
            - \`controllers\`
            - \`dao\`
            - \`models\`
            - \`middleware\`

            ## Environment Variables
            - \`PORT\`
            - \`DB_URL\``;
}

function generateGitignore() {
    return `node_modules
            .env
            .DS_Store
            coverage
            dist`;
}


function generateDockerfile() {
  return `# Use official Node.js image as base
FROM node:16

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 5000
# Start the app
CMD ["npm", "run", "dev"]
`;
}

  
  function generateDockerCompose() {
    return `version: '3'
  services:
    app:
      build: .
      ports:
        - "5000:5000"
      environment:
        - DB_URL=your_database_url
      volumes:
        - .:/app
      command: ["npm", "run", "dev"]`;
  }
  
  function generateDatabaseConfig(database) {
    if (database === "MongoDB") {
      return `const mongoose = require('mongoose');
            const dotenv = require('dotenv');
            dotenv.config();

            function dbConnect() {
            mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
                .then(() => console.log('MongoDB connected'))
                .catch((err) => console.log('MongoDB error: ', err));
            }

            module.exports = { dbConnect };`;
    } else if (database === "PostgreSQL") {
      return `const { Client } = require('pg');
                const dotenv = require('dotenv');
                dotenv.config();

                const client = new Client({
                connectionString: process.env.DB_URL,
                });

                client.connect()
                .then(() => console.log('PostgreSQL connected'))
                .catch((err) => console.log('PostgreSQL error: ', err));

                module.exports = { client };`;
    } else if (database === "MySQL") {
      return `const mysql = require('mysql2');
            const dotenv = require('dotenv');
            dotenv.config();

            const connection = mysql.createConnection(process.env.DB_URL);

            connection.connect((err) => {
            if (err) {
                console.log('MySQL error: ', err);
            } else {
                console.log('MySQL connected');
            }
            });

            module.exports = { connection };`;
    } else {
      throw new Error("Unsupported database type");
    }
}

  
  function returnFileContent(fileName, information) {
    const { type, name, database, dockerSupport } = information;
    let content = "";
  
    switch (fileName) {
      case "package.json":
        content = generatePackageJson(information);
        break;
      case "index.js":
        content = generateIndexJs(type);
        break;
      case "router.js":
        content = generateRouterJs(type);
        break;
      case "controller.js":
        content = generateControllerJs(type);
        break;
      case "dao.js":
        content = generateDaoJs(type);
        break;
      case "model.js":
        content = generateModelJs(type);
        break;
      case "middleware.js":
        content = generateMiddlewareJs(type);
        break;
      case ".env":
        content = generateEnv();
        break;
      case "database":
        content = generateDatabaseConfig(database);
        break;
      case "README.md":
        content = generateReadme(name);
        break;
      case ".gitignore":
        content = generateGitignore();
        break;
      case "Dockerfile":
        content = generateDockerfile();
        break;
      case "docker-compose.yml":
        content = generateDockerCompose();
        break;
      default:
        content = "";
    }
  
    return beautifyContent(content);
  }
  
  

export {
    createFolder,
    createFile,
    returnFileContent
};
