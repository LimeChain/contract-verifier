const fs = require('fs');
const path = require('path');
const glob = require('glob-promise');
const constants = require('./helpers/constants');
const cleanPath = require('./helpers/clean-path');
const removeDoubledSolidityVersion = require('./helpers/remove-doubled-solidity-version');
const replaceAllImportsRecursively = require('./helpers/replace-all-imports-recursively');

let flat = async function (filePath) {
    const inputFileContent = await fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.sol');
    let parentDirName = path.dirname(filePath);
    let dir = parentDirName + constants.SLASH;

    const isAbsolutePath = !dir.startsWith(constants.DOT);
    if (!isAbsolutePath) {
        dir = __dirname + constants.SLASH + dir
    }

    dir = cleanPath(dir);
    const pathLoc = parentDirName + constants.SOL;
    let srcFiles = await getSourceFiles(dir, pathLoc);

    return await replaceImports(inputFileContent, dir, fileName, srcFiles);
};

async function getSourceFiles(dir, path) {
    return await glob(path)
}

async function replaceImports(inputFileContent, dir, fileName_raw, srcFiles) {
    const outDir = './out';

    let outputFileContent = await replaceAllImportsRecursively(inputFileContent, dir, srcFiles);
    outputFileContent = removeDoubledSolidityVersion(outputFileContent);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    const fileName = `${fileName_raw}_flat.sol`;
    const filePath = `${outDir}/${fileName}`;
    fs.writeFileSync(filePath, outputFileContent);
    // console.log(`Success! Flat file ${fileName} is generated to  ${outDir} directory`)

    return {fileName, filePath};
}

module.exports = {flat};