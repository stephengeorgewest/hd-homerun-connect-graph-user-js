// ==UserScript==*
// @match http://tuner.lan/*
// @match http://192.168.0.160/*
// ==/UserScript==

class HDHomerun{
	constructor(){
		this.tuner = [];
		this.tuner.push(new Tuner());
		this.tuner.push(new Tuner());
	}
	
	/**<table>
	<tbody><tr><td>Virtual Channel</td><td>none</td></tr>
	<tr><td>Frequency</td><td>617.000 MHz</td></tr>
	<tr><td>Program Number</td><td>4</td></tr>
	<tr class="L"><td colspan="2"></td></tr>
	<tr><td>Modulation Lock</td><td>8vsb</td></tr>
	<tr><td>Signal Strength</td><td>100%</td></tr>
	<tr><td>Signal Quality</td><td>98%</td></tr>
	<tr><td>Symbol Quality</td><td>100%</td></tr>
	<tr class="L"><td colspan="2"></td></tr>
	<tr><td>Streaming Rate</td><td>2.264 Mbps</td></tr>
	<tr><td>Resource Lock</td><td>192.168.1.103</td></tr>
	</tbody></table>
	**/
	parseDataFromXML(responseXML){
		let titlePath = "//html/body/div/a/div[@class='T']/text()";
		let title2Path = "//html/body/div/div[@class='S']/text()";
		let tunerTitlePath = "//html/body/div/div[@class='T']/text()";
		let statusElementsPath = "//html/body/div/table/tbody/tr[not(@class)]";
			
		let xPathTitleResult = document.evaluate(titlePath, responseXML);
		let title = xPathTitleResult.iterateNext();
		let tunerStatus = new Status()
		let keys = Object.keys(tunerStatus);
		if(title){
			let tunerStatusText = document.evaluate(tunerTitlePath, responseXML).iterateNext();
			let tunerNumber = Number.parseInt(tunerStatusText.nodeValue.split(" ")[1]);
			let statusElements = document.evaluate(statusElementsPath, responseXML);
			let statusElement = statusElements.iterateNext();
			while(statusElement){
				let elementTitle = statusElement.childNodes[0].innerText.replace(' ', '');
				let elementValue = statusElement.childNodes[1].innerText;
				switch(elementTitle){
					case "Frequency":
						tunerStatus[elementTitle] = Number.parseFloat(elementValue);
						break;
					case "VirtualChannel":
					case "ModulationLock":
					case "ResourceLock":
						tunerStatus[elementTitle] = elementValue;
						break;
					default:
						tunerStatus[elementTitle] = Number.parseInt(elementValue);
				}
				statusElement = statusElements.iterateNext();
			}
			if(true/*validate capture*/){
				tunerStatus.Time = new Date();
				this.tuner[tunerNumber].addStatus(tunerStatus);
			}
		}
	}
}
class Tuner {
	constructor(){
		this.Status = null;//new Status();
		this.StatusHistory = [];
	}
	addStatus(tunerStatus){
		this.Status = tunerStatus;
		this.StatusHistory.push(this.Status);
	}
}
class Status {
	constructor(){
		this.VirtualChannel = "";//Virtual Channel	none
		this.Frequency = 0.0;//Frequency	593.000 MHz
		this.ProgramNumber = 0;//Program Number	1
		this.ModulationLock = "";//Modulation Lock	8vsb
		this.SignalStrength = 0;//Signal Strength	100%
		this.SignalQuality = 0;//Signal Quality	90%
		this.SymbolQuality = 0;//Symbol Quality	100%
		this.StreamingRate = 0;//Streaming Rate	16.224 Mbps
		this.ResourceLock = "";//Resource Lock	192.168.1.103
		this.time = null;
	}
}



/**
 * Dynamically loading javascript files.
 *
 * @param filename url of the file
 * @param callback callback function, called when file is downloaded and ready
 * http://stackoverflow.com/questions/8646925/how-to-integrate-third-party-javascript-libraries-in-userscripts#
 */
function loadjscssfile(filename, callback) {
	var fileref = document.createElement('script')
	fileref.setAttribute("type", "text/javascript")
	fileref.setAttribute("src", filename)
	if (fileref.readyState) {
		fileref.onreadystatechange = function() { /*IE*/
			if (fileref.readyState == "loaded" || fileref.readyState == "complete") {
				fileref.onreadystatechange = null;
				callback();
			}
		}
	} else {
		fileref.onload = function() {  /*Other browsers*/
			callback();
		}
	}

	// Try to find the head, otherwise default to the documentElement
	if (typeof fileref != "undefined")
		(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(fileref)
}


let hdc = new HDHomerun();
loadjscssfile("https://d3js.org/d3.v4.min.js", function(){
	
	let request = new XMLHttpRequest();

	request.onload = function (){
		hdc.parseDataFromXML(this.responseXML);
		var div = document.createElement("div");
			div.setAttribute("class", "B C");
		var innerDiv = document.createElement("div");
			innerDiv.setAttribute("class", "T");
			innerDiv.innerText = "ChartTitle";
			div.appendChild(innerDiv);
		var chartDiv = document.createElement("div");
			chartDiv.setAttribute("id", "d3Chart")
			div.appendChild(chartDiv);
			document.body.appendChild(div);
	};
	request.open("GET","tuners.html?page=tuner0");
	request.responseType = "document";
	request.send();
	
});

