const fs = require('fs');
const path = require('path');
const findFile = require('./find-file');
const updateImportObjectLocationInTarget = require('./update-import-object-location-in-target');
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute');

async function replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, srcFiles) {
	return new Promise(async (resolve) => {
		await replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve, srcFiles)
	})
}

async function replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve, srcFiles) {
	if (i >= importObjs.length) {
		return resolve(updatedFileContent)
	}

	let importObj = importObjs[i];
	const importedSrcFiles = srcFiles;
    let _updatedFileContent;

	//replace contracts aliases
	if (importObj.contractName) {
		_updatedFileContent = updatedFileContent.replace(importObj.alias + '.', importObj.contractName + '.')
	} else {
		_updatedFileContent = updatedFileContent
	}

	let { dependencyPath } = importObj;
    // dependencyPath = cleanPath(dependencyPath);
	let isAbsolutePath = !dependencyPath.startsWith('.');
	let filePath = isAbsolutePath ? dependencyPath : (dir + dependencyPath);
	// filePath = cleanPath(filePath);

	importObj = updateImportObjectLocationInTarget(importObj, _updatedFileContent);
	const importStatement = _updatedFileContent.substring(importObj.startIndex, importObj.endIndex);
	const fileBaseName = path.basename(filePath);
    const fileExists = fs.existsSync(filePath, fs.F_OK);

    if (fileExists) {
		const importedFileContentUpdated = await changeRelativePathToAbsolute(filePath);

		if (!importedSrcFiles.hasOwnProperty(fileBaseName)) {
			importedSrcFiles[fileBaseName] = importedFileContentUpdated;
			if (importedFileContentUpdated.includes(' is ')) {
				_updatedFileContent = _updatedFileContent.replace(importStatement, importedFileContentUpdated)
			} else {
				_updatedFileContent = importedFileContentUpdated + _updatedFileContent.replace(importStatement, '')
			}
		} else {
			_updatedFileContent = _updatedFileContent.replace(importStatement, '');
			//issue #1.
			if (_updatedFileContent.includes(importedSrcFiles[fileBaseName]) && _updatedFileContent.includes('import ')) {
				_updatedFileContent = importedFileContentUpdated + _updatedFileContent.replace(importedSrcFiles[fileBaseName], '')
			}
		}
	} else {
		if (!importedSrcFiles.hasOwnProperty(fileBaseName)) {
			const directorySeperator = process.platform === 'win32' ? '\\' : '/';
			const dirNew = dir.substring(0, dir.lastIndexOf(directorySeperator));
            _updatedFileContent = await findFile.byNameAndReplace(dirNew, dependencyPath, _updatedFileContent, importStatement, srcFiles)
		} else {
            console.log(`${filePath} File was NOT found when trying to flat`);
            _updatedFileContent = _updatedFileContent.replace(importStatement, '')
        }
	}

	i++;
	replaceAllImportsInCurrentLayerInner(i, importObjs, _updatedFileContent, dir, resolve, srcFiles)
}

module.exports = replaceAllImportsInCurrentLayer;
