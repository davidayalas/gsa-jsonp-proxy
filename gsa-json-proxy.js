var GSA_URL = "gsa_xml_url";

//get remote GSA function
function get(req){

  if(req.q){
    req.q = encodeURIComponent(req.q);
  }
  
  var url = GSA_URL;
  if(GSA_URL.indexOf("http:")===-1 && GSA_URL.indexOf("https:")===-1){
    GSA_URL = "http://" + GSA_URL;
  }
  
  var params = [];
  
  for(var param in req){
    if(req[param]!==""){
      params.push(param+"="+req[param]);
    }
  }
  
  url = GSA_URL+"?" + params.join("&") + "&" +(+new Date());
  Logger.log(url);
  return UrlFetchApp.fetch(url).getContentText("ISO-8859-1");

} 

//converts xml into json
function getJSON(xml,req){
  if(!xml){
    return "";
  }
  
  var document = XmlService.parse(xml),
      root = document.getRootElement();
  
  var xml_item, 
      json_item, 
      json = {};  

  for(var param in req){
    json[param] = req[param];
  }
    
  json.length = 0;
  json.total = 0;
  json.items = [];

  var results = root.getChildren('RES');
  if(root.getChildren('RES').length===0){
    return json;
  }
  
  json.total = root.getChildren('RES')[0].getChildren('M')[0].getText()*1;
  results = results[0].getChildren('R');
  var mtags = null;

  for(var i = 0; i < results.length; i++) {
    json_item = {};
    xml_item = results[i];
    json_item.url = xml_item.getChild('U').getText();
    json_item.encodedUrl = xml_item.getChild('UE').getText();
    
    if(xml_item.getChild('T')){
      json_item.title = xml_item.getChild('T').getText();
    }
    json_item.description = xml_item.getChild('S').getText();

    if(xml_item.getChildren('MT').length>0){
      var mtags = xml_item.getChildren('MT');
      json_item.metatags = {};
      for(var mt=0,lmt=mtags.length;mt<lmt;mt++){
          json_item.metatags[mtags[mt].getAttribute("N").getValue()] = mtags[mt].getAttribute("V").getValue();
      } 
      json_item.title = xml_item.getChild('T').getText();
    }
    json.items.push(json_item);
  }
  
  json.length = json.items.length;
  return json;
}

//http get interface
function doGet(e){
  var req = {
    "q" : e.parameters.query,
    "site" : e.parameters.site || "default_collection",
    "as_sitesearch" : e.parameters.sitesearch || "",
    "getfields" : e.parameters.getfields || "",
    "requiredfields" : e.parameters.requiredfields || "",
    "partialfields" : e.parameters.partialfields || "",
    "start" : e.parameters.start || 0,
    "client" : e.parameters.client || "default_frontend",
    "num" : e.parameters.num*1 || 10
  }
  
  var cb = e.parameters.callback ? e.parameters.callback + "(" : null;

  for(var param in req){
    if(typeof(req[param])==="object" && req[param][0]!=="" && req[param][0]!==undefined){
      req[param] = req[param][0];
    }
  }

  var xml = "";
  xml = get(req);
  var json = getJSON(xml,req);
  return ContentService.createTextOutput((cb?cb:"")+JSON.stringify(json)+(cb?")":"")).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

//testing function
function test(){
  doGet({
    parameters : {
      query : "help",
      start : 10,
      getfields : "keywords"
    }
  })
}