console.time('total')
console.time('dark')
if (chrome.devtools.panels.themeName == 'dark') {
	let link = document.createElement("LINK");  
	link.rel  = "stylesheet"
	link.href = "../css/dark.css"
	document.head.appendChild(link);
}
console.timeEnd('dark')