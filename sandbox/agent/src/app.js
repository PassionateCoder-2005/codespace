import express from 'express';
import morgan from "morgan"
import fs from 'fs';
import path from 'path';
const server=express();

server.use(morgan("combined"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
const WORKING_DIR='/workspace'

server.get("/", (req, res) => {
  res.send("Hello, from the sandbox agent!");
});
server.get("/list-files", async (req, res) => {

    const listFiles = async (dir, baseDir) => {

        const entries = await fs.promises.readdir(dir, {
            withFileTypes: true
        });

        const files = [];

        for (const entry of entries) {

            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (
                entry.isDirectory() &&
                ["node_modules", ".git"].includes(entry.name)
            ) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    };

    try {

        const files = await listFiles(WORKING_DIR, WORKING_DIR);

        return res.status(200).json({
            message: "List of files",
            files: files
        });

    } catch (err) {

        return res.status(500).json({
            message: "Error listing files",
            error: err.message
        });

    }
});
server.get("/read-file", async (req, res) => {
    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: "Please provide a file name in the query parameter 'files'"
        });
    }

    const fileList = files.split(",");

    const results = await Promise.all(
        fileList.map(async (fileName) => {
            const filePath = `${WORKING_DIR}/${fileName}`;

            try {
                const content = await fs.promises.readFile(filePath, "utf-8");

                return {
                    [filePath.replace(WORKING_DIR, "")]: content
                };
            } catch (err) {
                return {
                    [filePath.replace(WORKING_DIR, "")]: `Error reading file: ${err.message}`
                };
            }
        })
    );

    return res.status(200).json({
        message: "File contents",
        files: results
    });
});
server.patch("/update-file", async (req, res) => {
    const updates = req.body.updates;
    if(!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Please provide an array of updates in the request body"
        });
    }
   const results=await Promise.all(updates.map(async (update) => {
        const { fileName, content } = update;
        const filePath = path.join(WORKING_DIR, fileName);
        try {
            await fs.promises.writeFile(filePath, content, "utf-8");
            return {
                [filePath]: "File updated successfully"
            };
        } catch (err) {
            return {
                [filePath]: `Error updating file: ${err.message}`
            };
        }
    }));
    return res.status(200).json({
        message: "File update results",
        results: results
    });
}
);
server.post("/create-files", async (req, res) => {
    const files = req.body.files;
    if(!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: "Please provide an array of files in the request body"
        });
    }
    const results=await Promise.all(files.map(async (file) => {
        const { fileName, content } = file;
        const filePath = path.join(WORKING_DIR, fileName);

        try {
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(filePath, content, "utf-8");
            return {
                [filePath]: "File created successfully"
            };
        } catch (err) {
            return {
                [filePath]: `Error creating file: ${err.message}`
            };
        }
    }));
    return res.status(201).json({
        message: "File creation results",
        results: results
    });
});

export default server;