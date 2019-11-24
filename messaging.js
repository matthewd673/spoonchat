$(function ()
{
	var socket = io();
	$('form').submit(function()
	{
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		return false;
	});
})