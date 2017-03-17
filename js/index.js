/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function Alert(msg)
{
    document.getElementById("Alert").style.opacity = 1;
    document.getElementById("AlertInfo").innerHTML = msg;
}
function closeAlert()
{
    document.getElementById("Alert").style.opacity = 0;
}

function scan()
{
    cordova.plugins.barcodeScanner.scan(
    function(result)
    {
        document.getElementById("search").value = result.text;
        displayData();
    },
    function(error)
    {
        Alert(error);
    },
    {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        prompt : "Placera en streckkod i skanningsytan", // Android
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        format : "EAN", // default: all but PDF_417 and RSS_EXPANDED
        orientation : "unset", // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations : false, // iOS
        disableSuccessBeep: false // iOS
      }
   );
}

function keyboardDown()
{
    closeAlert();
    var header = document.getElementById("header");
    var field = document.getElementById("hiddenInput");
    var content = document.getElementById("result");
    setTimeout(function() {
    field.setAttribute('style', 'display:block;');
    field.focus();
    content.style.marginTop = "156px";
    header.style.position = "absolute";
    header.style.zIndex = "1";
    header.style.width = "100vw";
    setTimeout(function() {
    field.setAttribute('style', 'display:none;');
    header.style.position = "unset";
    content.style.marginTop = "0";
    }, 50);
    }, 50);
}
document.getElementById("formInput").addEventListener("submit", function(event)
{
    event.preventDefault();
    keyboardDown();
});

function startApp()
{
    document.getElementById("search").disabled = false;
    document.getElementById("result").innerHTML = "<p>Här kan du kontrollera om ett läkemedel omfattas av dopingreglerna eller inte. Förteckningen omfattar enbart läkemedel godkända i Sverige för humant bruk.</p>";
}

function closePopup()
{
    var el = document.getElementById("popupInfo");
    el.className = "animated slideOutRight";


    displayUpButton = true;
    scrolled();
    
}

function checkNetwork()
{
    if(!navigator.onLine)
    {
        return false;
    }
    document.getElementById("loader").style.display = "block";
    var fileURL = "http://fecabook.hol.es/handlefile.php?filename=check";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", fileURL, false); 
    rawFile.overrideMimeType('text/xml; charset=iso-8859-1');
    /*Not async because the function returns null if that is true*/
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                status =  true;
            }
            else
            {
                status = false;
            }
        }
    }
    try{rawFile.send();}
    catch(e){console.log(e); status = false;}
    document.getElementById("loader").style.display = "none";
    return status;
}

function replaceAll(str, find, replace)
{
        return str.replace(new RegExp(find, 'g'), replace);
}

function showInfo(id)
{
    closeAlert();
    var ids = ["forbud", "dispens", "ovrigt", "name", "form", "ic", "ooc", "klass"]
    var el = document.getElementById("popupInfo");
    el.style.display = "block";
    el.className = "animated slideInRight";
    for(var i = 0; i < ids.length; i++)
    {
        document.getElementById(ids[i]).innerHTML = currentData[id][ids[i]];
    }
    document.getElementById("upButton").style.display = "none";
    displayUpButton = false;
}

function isNum(string)
{
    return string.match(/^[0-9]+$/) != null;
}
function displayData()
{
    closeAlert();
    var results = 0;
    var string = document.getElementById("search").value;
    var format = '<li class="Lakemedel"><div id="ID" onclick="showInfo(this.id);" class="Produktnamn">NAMEFORM</div></li>';
    if(string.length > 0)
    {
        document.getElementById('result').innerHTML = "";
        currentData = {};
        var innerhtml = "";
        for(var i = 0; i < drugs.length; i++)
        {
            prep = drugs[i].split(";");
            if(isNum(string))
            {
                var ean = prep[7];
                if(results > 10){break;}
                if(ean == string)
                {
                    results += 1;
                    var name = "<h2><b>"+replaceAll(prep[0], "\n", "")+"</b></h2>";
                    var form = replaceAll(prep[1], "\n", "");
                    var ic = "<b>Tillåtet under tävling: </b>" + replaceAll(prep[2], "\n", "");
                    var ooc = "<b>Tillåtet utanför tävling: </b>"+replaceAll(prep[3], "\n", "");
                    var klass = "<b>Dopingklass: </b>"+replaceAll(prep[8], "\n", "");
                    var forbud = replaceAll(prep[4], "\n", "<br>");
                    var dispens = replaceAll(prep[5], "\n", "<br>");
                    var ovrigt = replaceAll(prep[6], "\n", "<br>");
                    
                    
                    if(forbud.length > 1){forbud = "<h3><b>Förbud</b></h3>" + forbud;}
                    else{forbud = "<b>Förbud: </b>" + forbud;}
                    if(dispens.length > 1){dispens = "<h3><b>Dispens</b></h3>" + dispens;}
                    else{dispens = "<b>Dispens: </b>" + dispens;}
                    if(ovrigt.length > 1){ovrigt = "<h3><b>Övrigt</b></h3>" + ovrigt;}
                    else{ovrigt = "<b>Övrigt: </b>" + ovrigt;}
                    var text = format.replace("ID", i);
                    var text = text.replace("NAME", name);
                    var text = text.replace("FORM", form);
                    innerhtml += text;
                    var form = "<b>Beredningsform: </b>" + form;
                    currentData[i] = {"name":name, "form":form, "ic":ic,
                                        "ooc":ooc, "forbud":forbud, "dispens":dispens,
                                        "ovrigt":ovrigt, "klass":klass};                    
                }
            }
            else
            {
                var name = prep[0];
                if(results > 10){break;}
                if (name.toLowerCase().indexOf(string.toLowerCase())+1 > 0)
                {
                    results += 1;
                    var name = "<h2><b>"+replaceAll(prep[0], "\n", "")+"</b></h2>";
                    var form = replaceAll(prep[1], "\n", "");
                    var ic = "<b>Tillåtet under tävling: </b>" + replaceAll(prep[2], "\n", "");
                    var ooc = "<b>Tillåtet utanför tävling: </b>"+replaceAll(prep[3], "\n", "");
                    var klass = "<b>Dopingklass: </b>"+replaceAll(prep[8], "\n", "");
                    var forbud = replaceAll(prep[4], "\n", "<br>");
                    var dispens = replaceAll(prep[5], "\n", "<br>");
                    var ovrigt = replaceAll(prep[6], "\n", "<br>");
                    
                    
                    if(forbud.length > 1){forbud = "<h3><b>Förbud</b></h3>" + forbud;}
                    else{forbud = "<b>Förbud: </b>" + forbud;}
                    if(dispens.length > 1){dispens = "<h3><b>Dispens</b></h3>" + dispens;}
                    else{dispens = "<b>Dispens: </b>" + dispens;}
                    if(ovrigt.length > 1){ovrigt = "<h3><b>Övrigt</b></h3>" + ovrigt;}
                    else{ovrigt = "<b>Övrigt: </b>" + ovrigt;}
                    var text = format.replace("ID", i);
                    var text = text.replace("NAME", name);
                    var text = text.replace("FORM", form);
                    innerhtml += text;
                    var form = "<b>Beredningsform: </b>" + form;
                    currentData[i] = {"name":name, "form":form, "ic":ic,
                                        "ooc":ooc, "forbud":forbud, "dispens":dispens,
                                        "ovrigt":ovrigt, "klass":klass}; 
                }
            }
            document.getElementById('result').innerHTML = innerhtml;
        }
        //document.getElementById('result').innerHTML = innerhtml;
        if (!innerhtml.length > 0)
        {
            document.getElementById('result').innerHTML = "<p>Inget Resultat!</p>";
        }
    }
    else
    {
        startApp();
    }
}

function update()
{
    var failMsg = "Röd gröna listan kräver en uppdatering, se till att du är ansluten till internet och starta om appen!";
    req = new XMLHttpRequest();
    var url = "http://fecabook.hol.es/databas.txt";
    req.open("GET", url, false);
    req.overrideMimeType('text/xml; charset=iso-8859-1');
    try
    {
        req.send();
        if(req.status == 200)
        {
            var text = req.responseText;
            localStorage.setItem("drugs", LZString.compress(text));
            drugs = text.split(";;")
        }
    }
    catch(e){alert(e); Alert(failMsg)}
}

function loadData()
{
    document.getElementById("loader").style.display = "block";
    drugs = LZString.decompress(localStorage.getItem("drugs")).split(";;");
    document.getElementById("loader").style.display = "none";
    startApp();
}

function checkUpdate()
{
    /* If user is starting app for first time*/
    if(document.getElementById("anslut") != null)
    {
        document.getElementById("anslut").innerHTML = "Ansluter...";
    }
    try
    {
        /*Chekca om internet anslutning existerar*/
        var netStatus = checkNetwork();
        if(netStatus)
        {
            var status = localStorage.getItem("drugs");
            if(status == null)
            {
                update();
            }
            else
            {
                loadData();
            }
        }
        else
        {
            loadData();
        }
    }
    catch(e)
    {
        var status = localStorage.getItem("drugs");
        if(status == null)
        {
            update();
        }
        else /*Offline but got all data*/
        {
            loadData();
        }
    }
}

function scrolled()
{
    var st = window.pageYOffset;
    if(st > 160 && displayUpButton)
    {
        document.getElementById("upButton").style.display = "block";
    }
    else
    {
        document.getElementById("upButton").style.display = "none";
    }
}
window.addEventListener("scroll", scrolled);
var url = "http://fecabook.hol.es/handlefile.php?filename=";
checkUpdate();