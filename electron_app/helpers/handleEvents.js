module.exports = function(dl, num) {
	num = num || 1;

	dl._downloads[0].on('start', function() {
		console.log('EVENT - Download '+ num +' started !');
	});

	dl._downloads[0].on('error', function() {
		console.log('EVENT - Download '+ num +' error !');
		console.log(dl.error);
	});

	dl._downloads[0].on('end', function() {
		console.log('EVENT - Download '+ num +' finished !');

		console.log(dl.getStats());
	});

	dl._downloads[0].on('retry', function() {
		console.log('EVENT - Download '+ num +' error, retrying...');
	});

	dl._downloads[0].on('stopped', function() {
		console.log('EVENT - Download '+ num +' stopped...');
	});

	dl._downloads[0].on('destroyed', function() {
		console.log('EVENT - Download '+ num +' destroyed...');
	});
};