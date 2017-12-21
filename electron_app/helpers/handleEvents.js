module.exports = function(dl, num) {
	num = num || 1;

	dl.on('start', function() {
		// event started download
	});

	dl.on('error', function() {
		// event error download -> dl.error
	});

	dl.on('end', function() {
		// event download finished
	});

	dl.on('retry', function() {
		// event retry download
	});

	dl.on('stopped', function() {
		// event download stopped
	});

	dl.on('destroyed', function() {
		// event download destroyed
	});
};