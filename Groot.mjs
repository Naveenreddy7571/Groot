import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'
class Groot
{
    constructor(repoPath='.')
    {
        this.repoPath = path.join(repoPath,'.groot'); // creates the .groot folder
        this.objectsPath = path.join(this.repoPath,'objects'); // creates the object folder
        this.headPath=path.join(this.repoPath,'head') //creates the head pointer file
        this.indexPath = path.join(this.repoPath,'index'); // creates a index file Staging area
        this.init();
    }

    async init()
    {
        await fs.mkdir(this.objectsPath,{recursive:true});
        try{
            await fs.writeFile(this.headPath,"",{flag:'wx'}); // wx:opens file for writing fails if file already exists

            await fs.writeFile(this.indexPath,JSON.stringify([]),{flag:'wx'});
        }
        catch(error)
        {
            console.log("groot is already intilized........");
        }
    }

    hashObject(content)
    {
        return crypto.createHash('sha1')
                .update(content,'utf-8')
                .digest('hex')
    }

    async add(fileToBeAdded)
    {
        const fileData = await fs.readFile(fileToBeAdded,{encoding:'utf-8'});
        const hashedFile=this.hashObject(fileData);
        console.log(hashedFile);
        const newFileHashedPath = path.join(this.objectsPath,hashedFile);
        await fs.writeFile(newFileHashedPath,fileData);
        console.log("file is added to the commit......")
    }
}

const groot=new Groot();
groot.add('./Hello.txt');