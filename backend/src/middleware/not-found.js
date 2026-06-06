const { NotFoundError } = require('../errors');

const notFound = (req, res) => {
	throw new NotFoundError('Route does not exist');
};

module.exports = notFound;