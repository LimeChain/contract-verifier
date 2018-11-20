/*
 * Leaves only 1st pragma solidity instruction and removes others
 */
function removeDoubledSolidityVersion(content) {
	const subStr = 'pragma solidity';
	//1st pragma solidity declaration
	const firstIndex = content.indexOf(subStr);
	const lastIndex = firstIndex + content.substr(firstIndex).indexOf(';') + 1;
	const contentPart = content.substr(lastIndex);
	let contentFiltered = contentPart;
	//remove other pragma solidity declarations
	const regex = new RegExp(subStr,'gi');
	let result;
	
	while ( (result = regex.exec(contentPart)) ) {
		const start = result.index;
		const end = start + contentPart.substr(start).indexOf(';') + 1;
		if (start !== firstIndex) contentFiltered = contentFiltered.replace(contentPart.substring(start, end), '')
	}

	return content.substr(0, lastIndex) + contentFiltered;
}

module.exports = removeDoubledSolidityVersion;