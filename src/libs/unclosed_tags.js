export default function getUnclosedTags(htmlString) {
  parser=new DOMParser();
  const htmlDoc=parser.parseFromString(htmlString, "text/html");
  const unclosedString = htmlDoc.firstChild.childNodes[1].innerHTML.substring(htmlString.length);
  return unclosedString.replace('</', '').split('>').filter(function(s) { return !!s });
}