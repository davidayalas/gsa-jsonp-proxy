# Google Apps Script - GSA (Google Search Appliance) Proxy
 
1. Create a new script in your [Google Drive](https://drive.google.com) account
2. Create a new script file and copy the content of gsa-json-proxy.js inside.
3. Setup GSA_URL with yours
4. Run "test" function to enable permissions
5. Publish as web application and copy the url
6. If access is public, check the permissions in the publish window (anonymous, ...)

Then you can request GSA JSON(P) in this way:

		function getURLParam (param) {
		 	if(!window.location.search){
		 		return "";
		 	}
			return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(param).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
		}

		var query = getURLParam("query"),
	 		sitesearch = getURLParam("sitesearch"),
	  		start = getURLParam("start")*1 || 0,
	  		site = getURLParam("site")
	  	;

		$.getJSON("https://script.google.com/macros/s/AKfycbzuOB1FNDPLwX5LOcJbn86_2VbRbYnVh-_HhrC0CXdhadNbmjk/exec?callback=?", {
		    "query" : query,
		    "site" : site,
		    "sitesearch" : sitesearch,
		    "start" : start
		}).done(function( data ) {
			$.each(data.items, function(i, item){
				console.log(data.title);
				console.log(data.description);
				console.log(data.encodedUrl);
				console.log(data.url);
			});
		});

