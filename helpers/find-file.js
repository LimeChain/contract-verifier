const fs = require('fs');
const glob = require('glob-promise');
const path = require('path');
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute');

function byName(dir, fileName) {
	return new Promise((resolve) => {
		return byNameInner(dir, fileName, resolve)
	})
}

async function byNameInner(dir, fileName, resolve) {
	const srcFiles = await glob(dir + '/**/*.sol');

	for (let j = 0; j < srcFiles.length; j++) {
		if (path.basename(srcFiles[j]) === fileName) {
			let fileContent = fs.readFileSync(srcFiles[j], 'utf8');
			resolve(fileContent);
			break
		}
	}

	dir = dir.substring(0, dir.lastIndexOf('/'));
	byNameInner(dir, fileName, resolve)
}

async function byNameAndReplace(dir, dependencyPath, updatedFileContent, importStatement, srcFiles) {
	return new Promise((resolve, reject) => {
		return byNameAndReplaceInner(dir, dependencyPath, updatedFileContent, importStatement, resolve, reject, srcFiles)
	})
}

async function byNameAndReplaceInner(dir, dependencyPath, updatedFileContent, importStatement, resolve, reject, srcFilesParm) {
	const srcFiles = await glob(dir + '/**/*.sol');
	let result = await byNameAndReplaceInnerRecursively(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, 0, srcFilesParm);
	let { flattenFileContent, importIsReplacedBefore } = result;

	if (importIsReplacedBefore) {
		flattenFileContent = flattenFileContent.replace(importStatement, '');
		return resolve(flattenFileContent)
	} else {
		if (dir.includes('/')) {
			dir = dir.substring(0, dir.lastIndexOf('/'));
			byNameAndReplaceInner(dir, dependencyPath, flattenFileContent, importStatement, resolve, reject)
		} else {
			flattenFileContent = flattenFileContent.replace(importStatement, '');
			return resolve(flattenFileContent)
		}
	}
}

async function byNameAndReplaceInnerRecursively(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, srcFilesParm) {
	return new Promise((resolve, reject) => {
		byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, srcFilesParm)
	})
}

async function byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore, srcFilesParm) {
	if (j >= srcFiles.length) return resolve({ flattenFileContent: updatedFileContent, importIsReplacedBefore });

	let isAbsolutePath = !dependencyPath.startsWith('.');
	const filePath = srcFiles[j];
    const importedSrcFiles = srcFilesParm;

	if (isAbsolutePath && filePath.includes(dependencyPath)) {
        let flattenFileContent = '';
		if (!importedSrcFiles.hasOwnProperty(path.basename(filePath)) || fs.existsSync(dependencyPath)) {
			let importFileContent;

			if (fs.existsSync(dependencyPath)) {
				importFileContent = await changeRelativePathToAbsolute(dependencyPath)
			} else {
				importFileContent = await changeRelativePathToAbsolute(filePath)
			}

            if (importFileContent.includes(' is ')) {
				flattenFileContent = updatedFileContent.replace(importStatement, importFileContent)
			} else {
				flattenFileContent = importFileContent + updatedFileContent.replace(importStatement, '')
			}

			importedSrcFiles[path.basename(filePath)] = importFileContent;
			resolve({ flattenFileContent, importIsReplacedBefore: true })
		} else {
			flattenFileContent = updatedFileContent.replace(importStatement, '');
			//issue #2.
			const fileName = importedSrcFiles[path.basename(dir + dependencyPath)];
			if (flattenFileContent.includes(fileName) && flattenFileContent.includes('import ')) {
				let importFileContent = fs.readFileSync(filePath, 'utf8');
				flattenFileContent = importFileContent + flattenFileContent.replace(fileName, '')
			}

			importIsReplacedBefore = true;
			j++;
			byNameAndReplaceInnerRecursivelyInner(importStatement, flattenFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore)
		}
	} else {
		j++;
		byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore)
	}
}

module.exports = {
	byName,
	byNameAndReplace
};