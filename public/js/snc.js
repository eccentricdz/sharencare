$(document).ready(function() {
	var screenH = screen.availHeight;
	var screenW = screen.availWidth;

	var uploadBtn = $('#upload');
	var inputEl = $('#my-file');
	var dndArea = $('.dnd-area');
	var fileList = $('.file-list');
	var container = $('.container');
	var progress = $('.progress-bar');
	var progressVal = $('.progress-value');
	var files;
	var formData ;
$('#center').click(function(event) {
		inputEl.trigger('click');
	});
	
	var uploading = false;
	

	function handleDragEnter(e)
	{
		e.preventDefault();
		e.stopPropagation();
		dndArea.addClass('dragenter');	}

	function handleDragOver(e)
	{
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy';
	}
	function handleFileSelect(e)
	{
		e.preventDefault();
		e.stopPropagation();
		dndArea.removeClass('dragenter');
		formData = new FormData();
		var output = [];
		var f;
		if(e.dataTransfer)
			files = e.dataTransfer.files;
		else if(e.target.files)
			files = e.target.files;
		if(!files.length)
			return;
		for(var i = 0; i<files.length;i++)
		{
			var ico;f = files[i];
			formData.append('file', f);
			if(f.type.match('image.*'))
			ico = 'icon-image';
			else if(f.type.match('audio.*'))
				ico = 'icon-headphones';
			else if(f.type.match('video.*'))
				ico = 'icon-film';
			else
				ico = 'icon-file3';
			//  <li class="file-preview"><span class="icon-image"></span>
			// <span class="file-title">My Image.jpg<p class="file-size">3453 bytes</p></span></li>

			output.push('<li class="file-preview" id="', i,'"><a><span class=', ico,'></span><p class="file-title">', f.name, '<p class="file-size">', f.size, 'bytes </p></p></a></li>');
		}

		fileList.html(output.join(' '));
		fileList.css('display', 'block');
		$('img#center').addClass('aside');

		uploadBtn.removeClass('inactive').addClass('active');

			}

	function handleDragEnd(e){
		dndArea.removeClass('dragenter');
	}

	function resetProgress(success)
	{
		if(success){
			progress.css('background','#49BD22');
			progressVal.css('color', '#49BD22');
			$('#prog-val').text('Upload process complete');
			progressVal.children('.icon-spinner').removeClass().addClass('icon-checkmark');
			}
			else{
			progress.css('background','#F12103');
			progressVal.css('color', '#F12103');
			$('#prog-val').text('Upload error');
			progressVal.children('.icon-spinner').removeClass().addClass('icon-spam');
		}

		setTimeout(function(){
			progress.css('width', '0px');
					progress.css('background','#F1780E');
					progressVal.removeClass('active').addClass('inactive');
					progressVal.css('color', '#F1780E');
						progressVal.children('span[class^="icon"]').removeClass().addClass('icon-spinner');
		}, 2500);


	}

var dnd = document.querySelector('.dnd-area');
var doc = document.documentElement;
var content = document.querySelector('.container');
	content.addEventListener('dragenter', handleDragEnter, false);
	content.addEventListener('drop', handleFileSelect, false);
	//content.addEventListener('drop', handleFileSelect, false);
	content.addEventListener('dragover', handleDragOver, false);
	content.addEventListener('dragend', handleDragEnd, false);

	inputEl.on('change', handleFileSelect);



	uploadBtn.on('click', function(event) {
		event.preventDefault();
		event.stopPropagation();
		progressVal.removeClass('inactive').addClass('active');
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/upload');
		xhr.upload.onprogress = function(event){
			if(event.lengthComputable && uploading)
			{
			
				var complete = (event.loaded / event.total);
				var progVal = Math.floor(complete*screenW);
				progress.css('width', progVal+'px');
			
				if(complete==1)
					$('#prog-val').text('Processing download link');
				else
						$('#prog-val').text(Math.floor(complete*100)+'%');
				//console.log('uploading.. '+complete*100+"%");
			}
		};
		xhr.onload = function()
		{
			if(xhr.status===200){
				if(uploading){
				progress.css('width',screenW+'px');
				resetProgress(true);
			displaySuccess(xhr.responseText);
		}
			}
			else{
				alert("ERROR "+xhr.status);
				resetProgress(false);
			}
			uploadBtn.removeClass('cancel').children('.upload-title').text('upload');
			uploading = false;
		};


		if(!uploading){
		xhr.send(formData);
		uploading = true;
		$(this).addClass('cancel').children('.upload-title').text('cancel');
						}
	else if(uploading)
	{
		xhr.abort();
		$(this).removeClass('cancel').children('.upload-title').text('upload');
		uploading = false;
		resetProgress(false);
	}
	});


function displaySuccess(link)
{
	$('.contents').css('display', 'none');
		$('#center').css('display', 'none');
		$('.success').css('display', 'block');
		$('span#link').text(link);
}
	
});