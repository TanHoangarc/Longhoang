const text = "This is **bold** and [img|http://link.com/a.jpg] and *#Tip|Desc#*";
const combinedPattern = /(\*\#.*?\#\*|\*\*.*?\*\*|\[img\|.*?\])/g;
const parts = text.split(combinedPattern);
console.log(parts);
