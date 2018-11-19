const constants = require('./constants');

/*
 * Leaves only 1st pragma solidity instruction and removes others
 */
function removeDoubledSolidityVersion(content) {
	const subStr = 'pragma solidity';
	//1st pragma solidity declaration
	const firstIndex = content.indexOf(subStr);
	const lastIndex = firstIndex + content.substr(firstIndex).indexOf(constants.SEMICOLON) + 1;
	const contentPart = content.substr(lastIndex);
	let contentFiltered = contentPart;
	//remove other pragma solidity declarations
	const regex = new RegExp(subStr,'gi');
	let result;
	while ( (result = regex.exec(contentPart)) ) {
		const start = result.index;
		const end = start + contentPart.substr(start).indexOf(constants.SEMICOLON) + 1;
		if (start !== firstIndex) contentFiltered = contentFiltered.replace(contentPart.substring(start, end), constants.EMPTY)
	}
	const finalContent = content.substr(0, lastIndex) + contentFiltered;

	return finalContent
}

module.exports = removeDoubledSolidityVersion;