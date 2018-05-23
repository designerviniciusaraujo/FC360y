"use strict";

var FCAdm$=(function(){
  "use strict";

  /* Accordion groups */
  var lastChangedFieldHash=null;
  var oChangedFieldsHashes={};
  var bHasClickedAccordion=false;
  function setAccordion(){
    var accHD=document.querySelectorAll('.accordionItemHeading');
    for (var i=0;i<accHD.length;i++)accHD[i].addEventListener('click',toggleAccordionItem,false);
    var oInputs=document.querySelectorAll('textarea,input,select');
    for (var i=0;i<oInputs.length;i++)oInputs[i].addEventListener('change',updateHash,true);
    hashChanged();
    if("onhashchange" in window)window.onhashchange=hashChanged; 
  }
  function hashChanged(){
    var sHash=window.location.hash;
    if(sHash){
      var sHashes=sHash.substr(1);
      var aHashes=sHashes.split(",");
      for(var i=0;i<aHashes.length;i++)showAnchorId(aHashes[i]);
    }
  }
  function toggleAccordionItem(){
    var sHash=window.location.hash;
    bHasClickedAccordion=true;
    if(sHash!="#"+this.id)document.location.href="#"+this.id;
    else showAnchorId(sHash.substr(1));
  }
  function showAnchorId(sAnchor){
    var este=document.getElementById(sAnchor);
    if(este){
      var itemClass=este.parentNode.className;
      if(itemClass=="accordionItem close")este.parentNode.className="accordionItem open";
      else if(bHasClickedAccordion)este.parentNode.className="accordionItem close";
      bHasClickedAccordion=false;
      este.scrollIntoView();window.scrollBy(0,-20);
    }
  }
  function updateHash(){
    var bAchei=false;var oParent=this.parentNode;
    while(!bAchei && oParent.className!=undefined){
      if(oParent.className!=undefined)bAchei=(oParent.className.indexOf("accordionItem")!=-1 && oParent.tagName=="DIV");
      if(!bAchei)oParent=oParent.parentNode;
    }
    if(bAchei){
      var oEste=oParent;
      var oHead=oEste.querySelector(".accordionItemHeading");
      if(oHead){
        lastChangedFieldHash=oHead.id;
        oChangedFieldsHashes[oHead.id]=true;
      }
    }
  }
  function setActionHash(este){
    var sHashes="";for(var sHash in oChangedFieldsHashes)if(oChangedFieldsHashes.hasOwnProperty(sHash))sHashes+=(sHashes=="")?sHash:","+sHash;
    este.form.action+="#"+sHashes;
  }

  /* Change Field Control */
  var oChangedFieldNames={};
  function fnSetChangedFields(oForm){
    if(oForm && oForm.nodeName=="FORM"){
      if(typeof oForm.FCChangedFields=="undefined")addFormInput(oForm,"hidden","FCChangedFields","");
      var oInputs=oForm.querySelectorAll('textarea,input,select');
      for(var i=0;i<oInputs.length;i++)oInputs[i].addEventListener('change',fnChangedFieldEvent,true);
    }
  } 
  function fnChangedFieldEvent(){
    var sFieldName=this.name;
    oChangedFieldNames[sFieldName]=true;
    var sItems="";for(var item in oChangedFieldNames)if(oChangedFieldNames.hasOwnProperty(item))sItems+=(sItems=="")?item:","+item;
    this.form.FCChangedFields.value=sItems;
  }

  function addFormInput(oForm,sType,sName,sValue){
    var i=document.createElement("input");
    i.setAttribute("type",sType);
    i.setAttribute("name",sName);
    i.setAttribute("value",sValue);
    oForm.appendChild(i);
  }

  function closeTip(){
    document.getElementById("mainTip").style.display="none";
    var oMainContent=document.getElementById("mainContent");
    if(oMainContent){
      oMainContent.style.width="100%";
      //oMainContent.style.width="calc(100% - 20px)";
      oMainContent.classList.remove("mainContentWid");
    }
  }

  function showGoogleGauge(bInit,idDivPos,sLabel,sSufix,iMaxValue,iCurValue,iDecimais){
    var XYZ=[];
    XYZ[0]=["pt","en"];
    if(bInit)google.charts.load('current',{'packages':['gauge'],'language':XYZ[0][FCAdmVars$.IdiomaAdm]});
    google.charts.setOnLoadCallback(function(){callbackGoogleChart(idDivPos,sLabel,iMaxValue,iCurValue);}); // chart callback
    function callbackGoogleChart(idDivPos,sLabel,iMaxValue,iCurValue){
      var oChartOptions={
        redFrom:iMaxValue*.9,
        redTo:iMaxValue,
        yellowFrom:iMaxValue*.75,
        yellowTo:iMaxValue*.9,
        minorTicks:5,
        max:iMaxValue
      }
      var oDivChart=document.getElementById(idDivPos);
      var aChartTable=[["Label","Value"],[sLabel,iCurValue]];
      var oGoogleData=google.visualization.arrayToDataTable(aChartTable);
      if(sSufix){
        var oFormatter=new google.visualization.NumberFormat({suffix:sSufix,fractionDigits:iDecimais});
        oFormatter.format(oGoogleData,1);
      }
      var oChart=new google.visualization["Gauge"](oDivChart);
      oChart.draw(oGoogleData,oChartOptions);
    }
  }

  function showTable(aTable,aColumnTypes,oTablePos,XYZde,XYZregistro,bIsOutdoor){
    var iTableRows=aTable.length,iTableCols=aTable[0].length,aColTotal=[],sCellValue,hasTotalRow=false,sColumnType;
    //thead
    var oTableHead=document.createElement("thead");
    var oRow=document.createElement("tr");
    for(var iCol=0;iCol<iTableCols;iCol++){
      var oCell=document.createElement("th");
      var sColLabel=aTable[0][iCol];
      if(sColLabel.label)sColLabel=sColLabel.label;
      oCell.appendChild(document.createTextNode(sColLabel));
      oRow.appendChild(oCell);
      if(aColumnTypes[iCol].hasTotal){
        aColTotal[iCol]=0;
        hasTotalRow=true
      }
    }
    oTableHead.appendChild(oRow);
    //tbody
    var oTableBody=document.createElement("tbody");
    var sLocale=(FCAdmVars$.IdiomaAdm==0?"pt-BR":"en-US");
    for(var iRow=1;iRow<iTableRows;iRow++){
      var oRow=document.createElement("tr");
      for(var iCol=0;iCol<iTableCols;iCol++){
        var oCell=document.createElement("td");
        sColumnType=aColumnTypes[iCol].type;
        if(sColumnType!="string" && sColumnType!="datetime" && sColumnType!="date")oCell.classList.add("numericAlign");
        sCellValue=aTable[iRow][iCol];
        if(sColumnType=="integer"||sColumnType=="money"||sColumnType=="real")oCell.setAttribute("data-ori",("00000000000000000000"+(sCellValue==null?"0":(Math.round(sCellValue*1000000)))).slice(-20));
        else if(sColumnType!="string")oCell.setAttribute("data-ori",sCellValue);
        if(sCellValue==null){
          var iZero=0;
          if(sColumnType=="money")oCell.innerHTML=iZero.toLocaleString(sLocale,{minimumFractionDigits:2,maximumFractionDigits:2});
          else if(sColumnType=="bigint"||sColumnType=="integer")oCell.innerHTML=iZero.toLocaleString(sLocale);
          else if(sColumnType=="real")oCell.innerHTML=iZero.toLocaleString(sLocale,{minimumFractionDigits:0,maximumFractionDigits:4});
        }
        else{
          if(sColumnType=="money")oCell.innerHTML=sCellValue.toLocaleString(sLocale,{minimumFractionDigits:2,maximumFractionDigits:2});
          else if(sColumnType=="datetime")oCell.innerHTML=new Date(sCellValue).toLocaleString(sLocale,{day:"numeric",month:"numeric",year:"2-digit",hour:"numeric",minute:"numeric"});
          else if(sColumnType=="date")oCell.innerHTML=new Date(sCellValue).toLocaleDateString(sLocale,{timeZone:"UTC"});
          else if(sColumnType=="bit")oCell.innerHTML=sCellValue.toString().charAt(0).toUpperCase() + sCellValue.toString().slice(1);
          else if(sColumnType=="bigint"||sColumnType=="integer")oCell.innerHTML=sCellValue.toLocaleString(sLocale);
          else if(sColumnType=="real")oCell.innerHTML=sCellValue.toLocaleString(sLocale,{minimumFractionDigits:0,maximumFractionDigits:4});
          else oCell.innerHTML=sCellValue.replace("/lojas/",FCAdmVars$.sURLAdm360 +"/lojas/");
        }
        oRow.appendChild(oCell);
        if(aColumnTypes[iCol].hasTotal)aColTotal[iCol]+=sCellValue;
      }
      oTableBody.appendChild(oRow);
    }
    //tfoot
    if(!bIsOutdoor){
      var oTableFoot=document.createElement("tfoot");
      if(hasTotalRow){
        var oRow=document.createElement("tr");
        for(var iCol=0;iCol<iTableCols;iCol++){
          var oCell=document.createElement("td");
          if(aColumnTypes[iCol].hasTotal){
            sColumnType=aColumnTypes[iCol].type;
            sCellValue=aColTotal[iCol];
            if(sColumnType=="money")sCellValue=sCellValue.toLocaleString(sLocale,{minimumFractionDigits:2,maximumFractionDigits:2});
            else if(sColumnType=="bigint"||sColumnType=="integer")sCellValue=sCellValue.toLocaleString(sLocale);
            else if(sColumnType=="real")sCellValue=sCellValue.toLocaleString(sLocale,{minimumFractionDigits:0,maximumFractionDigits:4});
            oCell.appendChild(document.createTextNode(sCellValue));
            oCell.classList.add("footTotal");
          }
          oRow.appendChild(oCell);
        }
        oTableFoot.appendChild(oRow);
      }
      var oRow=document.createElement("tr");
      oRow.className="RelatScriptFootTR";
      var oCell=document.createElement("td");
      oCell.className="TabRelatScriptFoot";
      oCell.colSpan=iCol;
      oCell.appendChild(document.createTextNode((iRow-1) +" "+ XYZregistro + (iRow>2?"s":"") + XYZde));
      oRow.appendChild(oCell);
      oTableFoot.appendChild(oRow);
    }
    //table create
    var oTable=document.createElement("table");
    oTable.cellPadding="2";
    oTable.cellSpacing="1";
    oTable.className="TabRelatScript"+ ((bIsOutdoor)?" TabOutdoor":"");
    oTable.appendChild(oTableHead);
    oTable.appendChild(oTableBody);
    if(!bIsOutdoor)oTable.appendChild(oTableFoot);
    oTablePos.appendChild(oTable);
    return oTable;
  }

  function sortTable(oTable){
    var oSortAtual=null,bAsc=true;
    initHead();
    function initHead(){
      var oCell;
      var setaSVG="<span class='sortArrowSpan hidden'><svg viewBox='0 0 24 24' class=sortArrow><path d='M12 8l-6 6 1.41 1.41 4.59-4.58 4.59 4.58 1.41-1.41z'/><path d='M0 0h24v24h-24z' fill='none'/></svg></span>";
      var aCell=oTable.getElementsByTagName("th");
      var iCell=aCell.length;
      for(var i=0;i<iCell;i++){
        oCell=aCell[i];
        oCell.setAttribute("colnum",i);
        oCell.innerHTML+=setaSVG;
        addEventFC(oCell,"click",function(){
          if(oSortAtual && oSortAtual!=this){
            oSortAtual.querySelector(".sortArrowSpan").classList.add("hidden");
            oSortAtual.querySelector(".sortArrowSpan").classList.remove("rotate180");
          }
          var iColSort=this.getAttribute("colnum");
          var oArrow=this.querySelector(".sortArrowSpan");
          oArrow.classList.remove("hidden");
          if(oSortAtual==this){
            bAsc=!bAsc;
            if(!bAsc){
              oArrow.classList.add("rotate180");
              oArrow.classList.remove("rotate0");
            }
            else{
              oArrow.classList.add("rotate0");
              oArrow.classList.remove("rotate180");
            }
          }
          else bAsc=true;
          oSortAtual=this;
          sortColumn(iColSort);
        });
      }
    }

    function sortColumn(iColSort){
      var oCell1,oCell2,sValor1,sValor2;
      var iOrder=(bAsc?1:-1);
      var aTbody=oTable.getElementsByTagName("tbody");
      var aRowsDom=aTbody[0].getElementsByTagName("tr");var iRowsDom=aRowsDom.length;
      var bHasOri=(aRowsDom[0].getElementsByTagName("td")[iColSort].getAttribute("data-ori")!=null);
      var aRows=[];
      for(var i=0;i<iRowsDom;i++)aRows.push(aRowsDom[i].cloneNode(true));
      aRows.sort(function(oRow1,oRow2){
        oCell1=oRow1.getElementsByTagName("td")[iColSort];
        sValor1=(bHasOri?oCell1.getAttribute("data-ori"):oCell1.innerHTML);
        oCell2=oRow2.getElementsByTagName("td")[iColSort];
        sValor2=(bHasOri?oCell2.getAttribute("data-ori"):oCell2.innerHTML);
        if(sValor1>sValor2)return 1*iOrder;
        else if(sValor2>sValor1)return -1*iOrder;
        else return 0;
      });
      for(var i=0;i<iRowsDom;i++)aRowsDom[i].replaceWith(aRows[i]);
    }

    function ReplaceWith(Ele){ //obj.replaceWith polyfill (ref: https://developer.mozilla.org/pt-BR/docs/Web/API/ChildNode/replaceWith)
      var parent=this.parentNode,
       i=arguments.length,
       firstIsNode= +(parent && typeof Ele==='object');
      if(!parent)return;
      while(i-- > firstIsNode){
        if(parent && typeof arguments[i]!=='object')arguments[i]=document.createTextNode(arguments[i]);
        if(!parent && arguments[i].parentNode){
          arguments[i].parentNode.removeChild(arguments[i]);
          continue;
        }
        parent.insertBefore(this.previousSibling,arguments[i]);
      }
      if(firstIsNode) parent.replaceChild(Ele,this);
    }
    if(!Element.prototype.replaceWith)Element.prototype.replaceWith=ReplaceWith;
    if(!CharacterData.prototype.replaceWith)CharacterData.prototype.replaceWith=ReplaceWith;
    if(!DocumentType.prototype.replaceWith)DocumentType.prototype.replaceWith=ReplaceWith;

  }

  function addChartColTypes(aDataTable,aFieldsTypes){
    var iFieldsTypes=aFieldsTypes.length;
    for(var i=0;i<iFieldsTypes;i++){
      var oField={};
      oField["label"]=aDataTable[0][i];
      oField["type"]=aFieldsTypes[i];
      aDataTable[0][i]=oField;
    }
  }

  function convertChartDateFields(aChartTable){
    var iRows=aChartTable.length;
    var iCols=aChartTable[0].length;
    for(var i=1;i<iRows;i++){
      for(var j=0;j<iCols;j++){
        if(aChartTable[0][j].type=="datetime"){
          var sAno=aChartTable[i][j].substr(0,4);
          var sMes=aChartTable[i][j].substr(5,2);
          var sDia=aChartTable[i][j].substr(8,2);
          var sHora=aChartTable[i][j].substr(11,2);
          var sMinuto=aChartTable[i][j].substr(14,2);
          aChartTable[i][j]=new Date(Date.UTC(sAno,sMes-1,sDia,sHora,sMinuto));
        }
        else if(aChartTable[0][j].type=="date"){
          var sAno=aChartTable[i][j].substr(0,4);
          var sMes=aChartTable[i][j].substr(5,2);
          var sDia=aChartTable[i][j].substr(8,2);
          aChartTable[i][j]=new Date(sAno,sMes-1,sDia);
        }
      }
    }
  }

  function addEventFC(target,eventType,eventHandler){
    if(target.addEventListener)target.addEventListener(eventType,eventHandler,false);
    else if(target.attachEvent)target.attachEvent('on'+eventType,eventHandler);
  }

  /* Chart functions */

  function initGoogleChart(fnCallback){
    if(typeof google=="undefined"){
      fnLoadScript("https://www.gstatic.com/charts/loader.js",false);
      var oInt;
      loadGoogleChartsRec(oInt,fnCallback);
    }
    else{
      loadGoogleChartsStrings();
      fnCallback();
    }
  }

  function loadGoogleChartsRec(oInt,fnCallback){
    if(oInt==undefined){
      console.log("loadGoogleCharts TRY");
      oInt=setInterval(function(){loadGoogleChartsRec(oInt,fnCallback);},FCAdmVars$.offlineRetryTime);
    }
    else if(typeof google!="undefined"){
      console.log("loadGoogleCharts OK");
      clearInterval(oInt);
      loadGoogleChartsStrings();
      if(typeof fnCallback!="undefined")fnCallback();
    }
  }

  function loadGoogleChartsStrings(){
    google.charts.load('current',{'packages':['corechart','gauge','geochart'],'mapsApiKey':'AIzaSyArC-mfeXOgJ4z9GvkLECsSjsqXTagShfo','language':XYZ[27][iLang$]});
  }

  function fnLoadScript(src,IsAsync){
    console.log("fnLoadScript");
    var fcw=document.createElement("script");
    fcw.type="text/javascript";
    fcw.async=IsAsync;
    fcw.src=src;
    var s=document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(fcw,s);
  }

  return{
    setAccordion:setAccordion,
    setActionHash:setActionHash,
    fnSetChangedFields:fnSetChangedFields,
    closeTip:closeTip,
    showGoogleGauge:showGoogleGauge,
    showTable:showTable,
    sortTable:sortTable,
    addChartColTypes:addChartColTypes,
    convertChartDateFields:convertChartDateFields,
    initGoogleChart:initGoogleChart
  }
})();

function MostraImgOnError(este,iIdioma){este.src="images/nd"+iIdioma+".gif";}
