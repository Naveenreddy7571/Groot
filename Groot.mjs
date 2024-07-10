#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import {diffLines} from 'diff';
import chalk from 'chalk';
import { Command } from 'commander';

const program=new Command();
class Groot {

    constructor(repoPath = '.') {
        this.repoPath = path.join(repoPath, '.groot');
        this.objectsPath = path.join(this.repoPath, 'objects');
        this.headPath = path.join(this.repoPath, 'head');
        this.indexPath = path.join(this.repoPath, 'index');
    }

    async init() {
        await fs.mkdir(this.objectsPath, { recursive: true });
        try {
            await fs.writeFile(this.headPath, "", { flag: 'wx' });
            await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: 'wx' });
            console.log("Groot initialized...");
        } catch (error) {
            console.log("Groot is already initialized...");
        }
    }

    hashObject(content) {
        return crypto.createHash('sha1')
            .update(content, 'utf-8')
            .digest('hex');
    }

    async add(fileToBeAdded) {
        try {
            const fileData = await fs.readFile(fileToBeAdded, { encoding: 'utf-8' });
            const hashedFile = this.hashObject(fileData);
            console.log(`Hashed File: ${hashedFile}`);
            const newFileHashedPath = path.join(this.objectsPath, hashedFile);
            await fs.writeFile(newFileHashedPath, fileData);
            await this.updateStagingArea(fileToBeAdded, hashedFile);
            console.log("File is added to the commit...");
        } catch (error) {
            console.error(`Error in add: ${error.message}`);
        }
    }

    async updateStagingArea(filePath, fileHash) {
        try {
            const indexFileData = JSON.parse(await fs.readFile(this.indexPath, { encoding: 'utf-8' }));
            indexFileData.push({ path: filePath, hash: fileHash });
            await fs.writeFile(this.indexPath, JSON.stringify(indexFileData));
        } catch (error) {
            console.error(`Error in updateStagingArea: ${error.message}`);
        }
    }

    async commit(message) {
        console.log('Starting commit...');
        try {
            const index = JSON.parse(await fs.readFile(this.indexPath, { encoding: 'utf-8' }));
            const parentCommit = await this.getCurrentHead();

            const commitData = {
                Date: new Date().toISOString(),
                message,
                files: index,
                parent: parentCommit
            };

            const commitHash = this.hashObject(JSON.stringify(commitData));
            await fs.writeFile(this.headPath, commitHash);
            const commitPath = path.join(this.objectsPath, commitHash);
            await fs.writeFile(commitPath, JSON.stringify(commitData));
            await fs.writeFile(this.indexPath, JSON.stringify([]));
            console.log("Commit successful...");
        } catch (error) {
            console.error(`Error in commit: ${error.message}`);
        }
    }

    async getCurrentHead() {
        try {
            const headContent = await fs.readFile(this.headPath, { encoding: 'utf-8' });
            return headContent.trim();
        } catch (error) {
            console.log(`Error in getCurrentHead: ${error.message}`);
            return null;
        }
    }

    async log() {
        let currentCommitHead = await this.getCurrentHead();

        while (currentCommitHead) {
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, currentCommitHead), { encoding: 'utf-8' }));

            console.log('-----------------------------------------------------------')
            
            console.log(`Commit : ${currentCommitHead}\n
                         TimeStamp:${commitData.Date}\n
                         Message:${commitData.message}`);

            console.log("---------------------------------------------------------------")

            currentCommitHead = commitData.parent;
        }
    }

    async showCommitDiff(commitHash) {
        const commitData = await this.getCommitData(commitHash);
        if (!commitData) {
            console.log("Commit not found");
            return;
        }
        console.log('Changes in the last commit are:');


        for (const file of commitData.files) {
            console.log(`File: ${file.path}`);
            const fileContent = await this.getFileContent(file.hash);
            
            if(commitData.parent != '')
            {
                const parentCommitData = await this.getCommitData(commitData.parent);
                
                const parentFileContent = await this.getParentFileData
                (parentCommitData,file.path);
                console.log(parentFileContent);
                if(parentFileContent !== undefined)
                {
                    console.log('\ndiff:');
                    const diff=diffLines(parentFileContent,fileContent);
               
                    diff.forEach(part => 
                        {
                            if(part.added)
                            {
                                process.stdout.write(chalk.green("++ "+part.value));
                            }
                            else if(part.removed)
                            {
                                process.stdout.write(chalk.red("-- "+part.value));
                            }else{
                                process.stdout.write(chalk.grey(part.value));
                            }
                            console.log("\n");
                        });

                    
                }

            }
        }
    }


async getParentFileData(commitData, filePath) {

    try {
        const parentFile = commitData.files.find(file => file.path === filePath);
        
        if (parentFile) {
            const parentFileContent = await this.getFileContent(parentFile.hash);

            try {
                return JSON.parse(parentFileContent);
            } catch (e) {
                return parentFileContent;
            }
        }
    } catch (error) {
        console.error('Error getting parent file data:', error);
    }
    
}

async giveStatus()
{
    const indexPath = path.join(this.indexPath);
    const getFileContent = JSON.parse(await fs.readFile(indexPath,{encoding:'utf-8'}));
    
    if(getFileContent == '')
    {
        console.log("Nothing in the staging area ");
    }
    else{
        console.log('Files to be commited');
        const n=getFileContent.length;
        for(let i =0;i<n;i++)
        {
            process.stdout.write(chalk.red(getFileContent[i].path));
            console.log('\n');
        }
    }

}

    async getFileContent(hash) {
        const filePath = path.join(this.objectsPath, hash);
        try {
            return await fs.readFile(filePath, { encoding: 'utf-8' });
        } catch (error) {
            console.log("No file found");
        }
    }

    async getCommitData(commitHash) {
        const filePath = path.join(this.objectsPath, commitHash);
        try {
            const data = await fs.readFile(filePath, { encoding: 'utf-8' });
            return JSON.parse(data);
        } catch (error) {
            console.log(`No commit found with the commit id ${commitHash}`);
        }
    }
}


program.command('init').action(()=>
{
    const groot = new Groot();
    groot.init();
});

program.command('add <filename>').action((file)=>
{
    const groot = new Groot();
    groot.add(file);
});

program.command('commit <message>').action((message)=>{
    const groot=new Groot();
    groot.commit(message);
});


program.command('log').action(()=>{
    const groot=new Groot();
    groot.log();
});

program.command('diff <commithash>').action((hash)=>
{
    const groot=new Groot();
    groot.showCommitDiff(hash);
})

program.command('status').action(()=>
{
    const groot = new Groot();
    groot.giveStatus();
})

program.parse(process.argv);
