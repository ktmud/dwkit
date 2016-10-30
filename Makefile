start:
	@export DEBUG="*" && supervisor -w 'lib,app.js' -p 1000 app.js 
