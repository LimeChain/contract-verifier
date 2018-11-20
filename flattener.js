const fs = require('fs');
const path = require('path');
const glob = require('glob-promise');
const cleanPath = require('./helpers/clean-path');
const removeDoubledSolidityVersion = require('./helpers/remove-doubled-solidity-version');
const replaceAllImportsRecursively = require('./helpers/replace-all-imports-recursively');

let flat = async function (filePath) {
    const inputFileContent = await fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.sol');
    let parentDirName = path.dirname(filePath);
    let dir = parentDirName + "/";

    const isAbsolutePath = !dir.startsWith(".");
    if (!isAbsolutePath) {
        dir = __dirname + "/" + dir
    }

    dir = cleanPath(dir);
    const pathLoc = parentDirName + '/**/*.sol';
    let srcFiles = await getSourceFiles(dir, pathLoc);

    return await replaceImports(inputFileContent, dir, fileName, srcFiles);
};

async function getSourceFiles(dir, path) {
    return await glob(path)
}

async function replaceImports(inputFileContent, dir, fileName_raw, srcFiles) {

    let outputFileContent = await replaceAllImportsRecursively(inputFileContent, dir, srcFiles);
    outputFileContent = removeDoubledSolidityVersion(outputFileContent);

    // This could come from config
    const outDir = './out';

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    const fileName = `${fileName_raw}_flat.sol`;
    const filePath = `${outDir}/${fileName}`;
    fs.writeFileSync(filePath, outputFileContent);

    return {fileName, filePath};
}

module.exports = {flat};