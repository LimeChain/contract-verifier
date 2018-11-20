
// TODO This was used before, it is not working with it - if all tests pass remove this file
function cleanPath(path) {
	// let cleanedPath
	// if (path.includes(constants.DIRTY_PATH)) {
	// 	cleanedPath = path.split(constants.DIRTY_PATH).join('/')
	// } else {
	// 	cleanedPath = path
	// }
    //
	// if (path.includes(constants.DIRTY_PATH_2)) {
	// 	const pathPartBefore = path.substring(0, path.indexOf(constants.DIRTY_PATH_2))
	// 	const folderBack = pathPartBefore.split('/').slice(-1)[0]
	// 	cleanedPath = path.split(folderBack + constants.DIRTY_PATH_2).join('')
	// }
    //
	// if (cleanedPath.includes(constants.DIRTY_PATH || constants.DIRTY_PATH_2)) {
	// 	return cleanPath(cleanedPath)
	// } else {
	// 	return cleanedPath
	// }
	return path;
}

module.exports = cleanPath;