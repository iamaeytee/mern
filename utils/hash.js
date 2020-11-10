const { hash, compare } = require('bcryptjs');

const rounds = 10;

const generateHash = (dataToBeHashed) => {
	return new Promise((resolve, reject) => {
		hash(dataToBeHashed, rounds, (err, hashed) => {
			if (err) {
				return reject(err);
			}

			return resolve(hashed);
		});
	});
};

const compareHash = (
	dataToBeComapred,
	hashToBeCompared) => {
	return new Promise((resolve, reject) => {
		compare(
			dataToBeComapred,
			hashToBeCompared,
			(err, same) => {
				if (err) {
					return reject(err);
				}

				return resolve(same);
			}
		);
	});
};

module.exports.generateHash = generateHash;
module.exports.compareHash = compareHash;