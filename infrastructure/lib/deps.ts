import { spawn } from 'child_process';
import * as path from 'path';


const spawnAsync = (workingDirectory:string, command: string, args:string[] | undefined) : Promise<void> => {
    const promise = new Promise<void>(
        (resolve, reject) => {
            const child = spawn(command, args, {cwd: workingDirectory });

            child.on("error", (code) => {
                reject(code);
            });

            child.on("message", (message) => {
                console.log(message);
            });

            child.on('exit', code => {
                if (code == 0) 
                    resolve();
                else
                    reject(code);
            });
        }
    );
    
    return promise;
};



export const buildDependencies = async() => {
    console.info("building dependencies...");
    //__dirname

    try {
        // await spawnAsync(
        //     path.resolve(__dirname, "../../api/functions/update-statistics/"),
        //     "npm",
        //     ["run", "build"]);

        // await spawnAsync(
        //     path.resolve(__dirname, "../../api/functions/update-diseases/"),
        //     "npm",
        //     ["run", "build"]);
        
        // await spawnAsync(
        //     path.resolve(__dirname, "../../client/"),
        //     "yarn",
        //     ["build"]);
    } catch (error) {
        console.error(error);
    }

}