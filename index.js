var express = require('express');
var app = express();
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var jszip = require('jszip');

var connection =require('mysql').createPool({
	waitForConnections : 'true',
	connectionLimit : 15,
	queueLimit : 5,
	host : 'localhost',
	user : 'root',
	password : 'password',
	database : 'sharencare'
});



var zip = new jszip();

var myFiles = [];var uploadDir = './useruploads/';

app.use(function(req, res, next){
	console.log(req.method+" "+req.url+" "+req.ip);
	next();
});

app.use(express.static(__dirname+'/public'));
app.post('/upload', function(req, res, next)
{


	

	//connectToDB();
	var uniqLink = generateUniqLink();
	var count = 0;myFiles = [];
	var form = new multiparty.Form({
		uploadDir : uploadDir
	});

	form.on('error', function(err)
	{
		console.log(err.stack);
		res.send(500);
	});


	form.on('part', function(part)
	{
		if(part.filename!==null)
		{	count++;
			part.filename = valid(part.filename,0);
			
			console.log(part.filename);
		
		var wstream = fs.createWriteStream(uploadDir+part.filename);
		part.pipe(wstream);

		part.on('end', function(){
		connection.query("insert into files(upload_id,file_name, file_type) values(?, ?, ?)", [uniqLink, part.filename, part.headers['content-type']], function(err, result){
			if(err){
				console.log(err);
				res.send(500);
			}

			console.log("Succesfully updated the DB with the file "+result.insertId+" : "+part.filename);
		});
		});
		myFiles.push(part.filename);
		
	}
	else
	{
		console.log(part.name);
	}
	});

	form.on('aborted', function(){
		res.send(500, 'Upload Aborted');
	});

	form.on('close', function(){
		console.log('Upload Complete! ('+form.bytesReceived+")");
		res.send(200, uniqLink);
		
	});
	form.parse(req);

});


app.get('/:uid', function(req, res, err){
//connectToDB();
		connection.query('select * from files where upload_id = ?', [req.params.uid], function(err, results)
		{
			if(err){
				console.log(err);
					res.send(500);}
					console.log(JSON.stringify(results));
			if(results.length>0)
				res.redirect('/download.html?uid='+req.params.uid);
			else{
				res.redirect('/404.html');}
		});

	
});

app.post('/download/:uid', function(req, res, err){
	//connectToDB();
	connection.query('select * from files where upload_id = ?', [req.params.uid], function(err, results)
		{
			if(err){
				console.log(err);
					res.send(500);}
			var myJson = '{"files" : '+JSON.stringify(results)+'}';
			res.set('content-type', 'application/json');
			res.send(200, myJson);
		});
});

app.get('/download/:uid/:file', function(req, res, err){
	connection.query('select * from files where upload_id=? and file_name=?', [req.params.uid, decodeURIComponent(req.params.file)], function(err, results){
			if(err){
				console.log(err);
					res.send(500);}
					if(results.length===0)
					res.redirect('/404.html');
					else{
						console.log(results);
						res.download(uploadDir+decodeURIComponent(req.params.file));
					}
	});
});

app.use(function(req, res, err){
	res.redirect('/404.html');
});
app.listen(3000);
console.log('Share N Care server started at http://localhost:3000 ..');

function generateUniqLink(){
	return (Math.random()+1).toString(36).substr(2,7);
}

function valid(filename, index)
{
	var myfile = filename;var exists;

	if(index>0)
		filename="("+index+")"+filename;
	try{
	exists = fs.openSync(uploadDir+filename,'r');
	return valid(myfile, index+1);
}
catch(e)
{
	return filename;
}
}

function createZip(count, uniqLink)
{
	console.log('..generating zip');
				for(var i = 0;i<count;i++)
				{
					var fData = fs.readFileSync(uploadDir+myFiles[i]);

					zip.file(myFiles[i], fData);
					fs.unlink(uploadDir+myFiles[i]);
				}
				try{
				buffer = zip.generate({type:'nodebuffer'});
			}
			catch(e){
					console.log(e);
				}
				fs.writeFile(uploadDir+'MyZip_'+uniqLink+'.zip', buffer, function(err){if(err)console.log(error);});
				console.log('zip generated');
}


function connectToDB(){
	connection.connect(function(err){
	if(err)
	{
		console.log("error connecting to mysql : "+err.stack);
		res.send(500, 'Unable to connect to DB');
		return;
	}
	console.log("Connected to database SharenCare as : "+connection.threadId);
});
}