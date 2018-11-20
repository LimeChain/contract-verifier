const fs = require('fs');
const path = require('path');

/*
 * Replaces relative paths to absolute path for imports
 */
const changeRelativePathToAbsolute = (filePath) => {
	const dir = path.dirname(filePath);
	const fileContent = fs.readFileSync(filePath, 'utf8');

	return new Promise(async (resolve) => {
		let fileContentNew = fileContent;
		const findAllImportPaths = require('./find-all-import-paths');
		const importObjs = await findAllImportPaths(dir, fileContent);

		if (!importObjs || importObjs.length === 0) {
			resolve(fileContentNew)
		}

		importObjs.forEach((importObj) => {
			const { dependencyPath, fullImportStatement } = importObj;
			const isAbsolutePath = !dependencyPath.startsWith('.');

			if (!isAbsolutePath) {
				let dependencyPathNew = dir + '/' + dependencyPath;
				// dependencyPathNew = cleanPath(dependencyPathNew);
				let fullImportStatementNew = fullImportStatement.split(dependencyPath).join(dependencyPathNew);
				fileContentNew = fileContentNew.split(fullImportStatement).join(fullImportStatementNew)
			}
		});

		resolve(fileContentNew)
	})
};

module.exports = changeRelativePathToAbsolute;