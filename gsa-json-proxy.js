var GSA_URL = "url";
 
//get remote GSA function
function get(q, site, start, sitesearch){
  q = encodeURIComponent(q);
  var url = GSA_URL;
  if(GSA_URL.indexOf("http:")===-1 && GSA_URL.indexOf("https:")===-1){
    GSA_URL = "http://" + GSA_URL;
  }
  url = GSA_URL+"?q=" + q + "&site=" + site + "&start=" + start + "&as_sitesearch=" + sitesearch + "&" +(+new Date());
  Logger.log(url);
  return UrlFetchApp.fetch(url).getContentText("ISO-8859-1");
} 

//return a json message if something fails
function returnMsg(message,cb){
  message = message || "";
  return ContentService.createTextOutput((cb?cb:"")+"{\"message\":\""+message+"\"}"+(cb?")":"")).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

//converts xml into json
function getJSON(xml,q,site,start){
  if(!xml){
    return "";
  }
  
  var document = XmlService.parse(xml),
      root = document.getRootElement()
  ;
  
  var xml_item, 
      json_item, 
      json = {
        'q':'',
        'start':0,
        'sitesearch':'',
        'site':'',
        'length':0,
        'total':0,
        'items':[]
      };  

  json.q = q;
  json.site = site;
  json.start = start;
  json.length = json.items.length;
  json.total = 0;
  
  var results = root.getChildren('RES');
  if(root.getChildren('RES').length===0){
    return json;
  }
  
  json.total = root.getChildren('RES')[0].getChildren('M')[0].getText()*1;
  results = results[0].getChildren('R');

  for (var i = 0; i < results.length; i++) {
    json_item = {};
    xml_item = results[i];
    json_item.url = xml_item.getChild('U').getText();
    json_item.encodedUrl = xml_item.getChild('UE').getText();
    if(xml_item.getChild('T')){
      json_item.title = xml_item.getChild('T').getText();
    }
    json_item.description = xml_item.getChild('S').getText();
    json.items.push(json_item);
  }

  return json;
}

//http get interface
function doGet(e){
  if(!e || !e.parameters){
    return returnMsg("not enough parameters");
  }
  
  var q = e.parameters.query,
      site = e.parameters.site || "default_collection",
      sitesearch = e.parameters.sitesearch || "",
      cb = e.parameters.callback ? e.parameters.callback + "(" : null,
      start = e.parameters.start || 0
  ;

  if(typeof(q)==="object" && q[0]!==0){
    q = q[0];
  }

  var xml = "";
  if(!q || q===""){    
    return returnMsg("query no setted",cb);
  }
 
  xml = get(q,site,start,sitesearch);
  var json = getJSON(xml,q,site,start,sitesearch);
  return ContentService.createTextOutput((cb?cb:"")+JSON.stringify(json)+(cb?")":"")).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

//testing function
function test(){
  doGet({
    parameters : {
      query : "help",
      start : 10
    }
  })
}