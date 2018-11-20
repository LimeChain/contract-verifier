const fs = require('fs');
const path = require('path');
const decomment = require('decomment');
const findFile = require('./find-file');

/*
 * Finds all import paths
 */
function findAllImportPaths(dir, content) {
	return new Promise(async (resolve) => {
		content = decomment(content, {safe: true});
		const regex = new RegExp('import ','gi');
		const importsCount = (content.match(regex) || []).length;

        let allImports = [];
        let importsIterator = 0;
		let result;

		while ( (result = regex.exec(content)) ) {
			const startImport = result.index;
			const endImport = startImport + content.substr(startImport).indexOf(';') + 1;
			const fullImportStatement = content.substring(startImport, endImport);
			const fullImportParts = fullImportStatement.split('"');
			const fullImportPartsAlt = fullImportStatement.split('\'');
			const dependencyPath = fullImportParts.length > 1 ? fullImportParts[1] : fullImportPartsAlt[1];
			const fullImportPartsByAs = fullImportStatement.split(' as ');
			let alias = fullImportPartsByAs.length > 1 ? fullImportPartsByAs[1].split(';')[0] : null;

			let importObj = {
				startIndex: startImport,
				endIndex: endImport,
				dependencyPath,
				fullImportStatement,
				alias,
			};

            if (alias) {
				alias = alias.replace(/\s/g, '');
				let fileExists = fs.existsSync(dependencyPath, fs.F_OK);
				let fileContent;

				if (fileExists) {
					fileContent = fs.readFileSync(dependencyPath, 'utf8')
				} else {
					dir = dir.substring(0, dir.lastIndexOf('/'));
					fileContent = await findFile.byName(dir, path.basename(dependencyPath))
				}

				if (fileContent.includes('contract ')) {
					importObj.contractName = getContractName(fileContent)
				}
			}

			importsIterator++;
			allImports.push(importObj)
		}
		if (importsIterator === importsCount) resolve(allImports)
	})
}

function getContractName(fileContent) {
	return fileContent.substring((fileContent.indexOf('contract ') + 'contract '.length), fileContent.indexOf('{')).replace(/\s/g, '')
}

module.exports = findAllImportPaths;
