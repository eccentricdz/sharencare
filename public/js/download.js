$(document).ready(function() {
	var fileList = $('.file-list');
	fileList.css('display', 'block');

	fileList.delegate('.dload_link', 'hover', function(event) {
		var icospan = $(this).children('span[data-icon]');
		if(event.type=='mouseenter')
		{
			icospan.removeClass().addClass('icon-download');
		}
		else if(event.type=="mouseleave")
		{
			var icotype = icospan.attr('data-icon');
			icospan.removeClass().addClass(icotype);
		}
	});

	function loadPageVar (sVar) {
  return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}
	var uid = loadPageVar('uid');
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/download/'+uid);
	xhr.onload = function(){
		if(xhr.status==200)
		{
			var files = JSON.parse(xhr.responseText).files;
			console.log(files);
			if(files.length === 0)
				window.location = "./404";
			else{
				var output = [];
				for(var i = 0;i<files.length;i++)
				{
					var type = files[i].file_type;
					var name = files[i].file_name;
					var link = '/download/'+uid+'/'+encodeURIComponent(name);
					if(type.match('image.*'))
			ico = 'icon-image';
			else if(type.match('audio.*'))
				ico = 'icon-headphones';
			else if(type.match('video.*'))
				ico = 'icon-film';
			else
				ico = 'icon-file3';
					output.push('<li class="file-preview" id="', i,'"><a class="dload_link" href=', link, '><span data-icon=',ico,'class=', ico,'></span><p class="file-title">', name, '</p></a></li>');
				}

				fileList.html(output.join(' '));
			}
		}
		else
		{
			alert("ERROR "+xhr.status+" : "+xhr.responseText);
		}
	};

	xhr.send();
});