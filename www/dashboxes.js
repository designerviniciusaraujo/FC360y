"use strict";

var dashBoxes$=(function(){
  "use strict";
  var oDashBoxes,
   sDashBoxes="", //position div id
   sDashListReport=null, //report name
   sDashListDescription=null, //report description
   sPar1=null,sPar2=null,sPar3=null,sPar4=null,sPar5=null,sPar6=null,sPar7=null,sPar8=null,  //report parameters
   oProp={},  //library properties
   sDraggedID,
   hasDrag=true,
   iMaxDashes;

  function initDashBoxes(){
    iMaxDashes=FCAdmVars$.dsh;
    if(iMaxDashes>0){
      var sDashBoxesId=dashBoxes$.sDashBoxes;
      oDashBoxes=document.getElementById(sDashBoxesId);
      oDashBoxes.innerHTML=FCAdmVars$.loadingIcon;
      if(oDashBoxes){
        oProp[sDashBoxesId]={};
        for(var i=1;i<=8;i++)if(dashBoxes$["sPar"+ i])oProp[sDashBoxesId]["sPar"+ i]=escape(dashBoxes$["sPar"+ i]);
        getDashList(oDashBoxes);
      }
    }
  }

  function getDashList(oDashBoxes){
    var sParams="storeid="+ FC360$.iStoreID;
    sParams+="&tk="+ FC360$.sToken;
    //sParams+="&ftk="+ FCAdmVars$.ftk;
    sParams+="&ks=true";
    sParams+="&token="+ FC360$.sToken;
    sParams+="&cmd=REL";
    sParams+="&objectname=Dashes+list";
    if(dashBoxes$.sDashListReport)sParams+="&par1="+ escape(dashBoxes$.sDashListReport);
    if(dashBoxes$.sDashListDescription)sParams+="&par2="+ escape(dashBoxes$.sDashListDescription);
    fnAjaxExecAdmFC(FCAdmVars$.sURLAdm360 +"/adm/Adm360.asp",sParams,true,fnCallbackGetDashList,oDashBoxes,dashBoxes$.hasDrag);
  }

  function fnAjaxExecAdmFC(file,sParams,IsPOST,fnCallback,param1,param2,param3){
    if(navigator.onLine){
      sParams=sParams.replace(/ /g,"+");
      var oRet=null;
      if(window.XMLHttpRequest){oRet=new XMLHttpRequest();}
      else if(window.ActiveXObject){oRet=new ActiveXObject("Microsoft.XMLHTTP");} 
      else{return;}
      oRet.onreadystatechange=function(){if(oRet.readyState==4){fnCallback(oRet,param1,param2,param3);}}
      if(IsPOST){
        oRet.open('POST',file,true);
        oRet.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        oRet.send(sParams);
      }
      else{
        oRet.open('GET',file+'?'+sParams,true);
        oRet.send('');
      }
    }
    else setTimeout(function(){fnAjaxExecAdmFC(file,sParams,IsPOST,fnCallback,param1,param2,param3);},FCAdmVars$.offlineRetryTime); /* if not online, call ajax again */
  }

  function fnCallbackGetDashList(oHTTP,oDashBoxes,hasDrag){
    oDashBoxes.innerHTML="";
    try{var oJSON=JSON.parse(oHTTP.responseText);}catch(e){var oJSON=null;}
    if(oJSON){
      if(oJSON.err=="ErrOK"){
        var iRegs=oJSON.report.records;
        if(iRegs>0){
          if(iRegs>iMaxDashes)iRegs=iMaxDashes;
          var aDashList={};
          var oDashBoxesAll=document.createElement("div");
          oDashBoxesAll.className="dashBoxesAll";
          oDashBoxes.appendChild(oDashBoxesAll);
          oDashBoxes.classList.remove("hideThis");
          for(var i=0;i<iRegs;i++){
            var aReg=oJSON.report.data[i];
            aDashList["id"+ aReg[0]]=getFirstSelectParam(aReg);
          }
          oProp[oDashBoxes.id].dashList=aDashList;
          showDashBoxes(oDashBoxesAll,hasDrag);
        }
      }
      else if(oJSON.err=="ErrNotLgo")FC360$.logoutUser();
    }
    else console.log("Error reading dashes list",oJSON);
  }

  function getFirstSelectParam(aReg){
    if(aReg[5]!=""){
      var oSelect={
        "paramName":aReg[4],
        "paramOptions":aReg[5]
      };
    }
    else var oSelect={"paramName":""};
    return oSelect;
  }

  function showDashBoxes(oDashBoxesAll,hasDrag){
    FCAdm$.initGoogleChart(
      function(){
        var sDashBoxesId=oDashBoxesAll.parentNode.id;
        var aDashList=oProp[sDashBoxesId].dashList;
        if(hasDrag){
          var aBoxPositions=loadBoxesPositions(aDashList,sDashBoxesId);
          showBoxes(aBoxPositions);
          for(var sItem in aBoxPositions)delete aDashList[sItem];
        }
        showBoxes(aDashList);
        function showBoxes(aDashList){
          if(aDashList){
            var aDashKeys=Object.keys(aDashList);
            var iDashList=aDashKeys.length;
            var sPar1=oProp[sDashBoxesId].sPar1;
            if(!sPar1)sPar1=0;
            FC360$.temporizeLoop(FCAdmVars$.dashboardWait,temporizeDash,{value:0},aDashKeys,iDashList,aDashList,oDashBoxesAll,sPar1,hasDrag);
          }
        }
      }
    );
  }

  function temporizeDash(oCounter,aDashKeys,iDashList,aDashList,oDashBoxesAll,sPar1,hasDrag){
  /* Temporized function for calling each dash */
    var IDRel=aDashKeys[oCounter.value].slice(2);
    showDash(IDRel,oDashBoxesAll,null,aDashList[aDashKeys[oCounter.value]],sPar1,hasDrag);
    oCounter.value++;
    return !(oCounter.value<iDashList);
  }

  function loadBoxesPositions(aDashList,sDashBoxesId){
    var aBoxPositions=[],oBoxPositions={};
    var sBoxPositions=localStorage["boxPositions_"+ FC360$.iStoreID +"_"+ sDashBoxesId];
    if(sBoxPositions){
      aBoxPositions=sBoxPositions.split(",");
      var iBoxPositions=aBoxPositions.length;
      for(var i=0;i<iBoxPositions;i++){
        if(aDashList[aBoxPositions[i]])oBoxPositions[aBoxPositions[i]]=aDashList[aBoxPositions[i]];
      }
    }
    return oBoxPositions;
  }

  function showDash(sObjectID,oDashBoxesAll,oDashBox,oSelectParam,iSelectedItem,hasDrag){
    var bHasParam=(oSelectParam && oSelectParam.paramName!="");
    var bDragBefore=true;
    if(oDashBox)var sDashBoxesId=oDashBox.parentNode.parentNode.id;
    else{
      oDashBox=document.createElement("div");
      oDashBox.className="dashBox dashThumb";
      if(!oDashBoxesAll.parentNode)return; /* Abandons showdash if id not found. User went to other page? */
      var sDashBoxesId=oDashBoxesAll.parentNode.id;
      oDashBox.id="id_"+ sDashBoxesId +"_"+ sObjectID;
      if(bHasParam){
        oDashBox.setAttribute("selectparam",JSON.stringify(oSelectParam));
        oDashBox.setAttribute("selecteditem",iSelectedItem);
      }
      if(hasDrag){
        oDashBox.draggable=true;
        oDashBox.addEventListener("dragstart",handleDragStart,false);
        oDashBox.addEventListener("dragend",handleDragEnd,false);
        oDashBox.addEventListener("dragover",handleDragOver,false);
        oDashBox.addEventListener("dragleave",handleDragLeave,false);
        oDashBox.addEventListener("drop",handleDrop,false);
      }
      oDashBoxesAll.appendChild(oDashBox);
    }
    var sParams="storeid="+ FC360$.iStoreID;
    sParams+="&tk="+ FC360$.sToken;
    //sParams+="&ftk="+ FCAdmVars$.ftk;
    sParams+="&ks=true";
    sParams+="&token="+ FC360$.sToken;
    sParams+="&cmd=REL";
    sParams+="&objectid="+ sObjectID;
    if(bHasParam){
      if(oProp[sDashBoxesId].sPar1>0 && iSelectedItem==0)sParams+="&par1="+ oProp[sDashBoxesId].sPar1;
      else sParams+="&par1="+ iSelectedItem;
    }
    else if(oProp[sDashBoxesId].sPar1)sParams+="&par1="+ oProp[sDashBoxesId].sPar1;
    for(var i=2;i<=8;i++)if(oProp[sDashBoxesId]["sPar"+ i])sParams+="&par"+ i +"="+ oProp[sDashBoxesId]["sPar"+ i];
    fnAjaxExecAdmFC(FCAdmVars$.sURLAdm360 +"/adm/Adm360.asp",sParams,true,fnCallbackReport,oDashBox);

    function handleDragStart(e){
      this.classList.add("dragStart");
      this.classList.remove("dragEnd");
      sDraggedID=this.id;
      e.dataTransfer.setData("text",sDraggedID);
      if(e.dataTransfer.setDragImage){
        var oDragImg=new Image(); 
        oDragImg.src="images/IcDrag.svg";
        e.dataTransfer.setDragImage(oDragImg,-20,-20);
      }
    }

    function handleDragEnd(e){
      this.classList.add("dragEnd");
      this.classList.remove("dragStart");
    }

    function handleDragOver(e){
      e.preventDefault();
      var oRect=this.getBoundingClientRect();
      var xCentro=(oRect.left+oRect.right)/2;
      bDragBefore=(e.pageX<xCentro)?true:false;
      if(this.id!=sDraggedID)this.classList.add("dragOver"+ ((bDragBefore)?"Before":"After"));
    }

    function handleDragLeave(e){
      this.classList.remove("dragOverBefore");
      this.classList.remove("dragOverAfter");
    }

    function handleDrop(e){
      e.preventDefault();
      this.classList.remove("dragOverBefore");
      this.classList.remove("dragOverAfter");
      sDraggedID=e.dataTransfer.getData("text");
      if(this.id!=sDraggedID){
        var oDragged=document.getElementById(sDraggedID);
        if(oDragged){
          if(bDragBefore)this.parentNode.insertBefore(oDragged,this); //drag before
          else this.parentNode.insertBefore(oDragged,this.nextSibling); //drag after
        }
        var sDashBoxesId=this.parentNode.parentNode.id;
        saveBoxesPositions(sDashBoxesId);
      }
    }

    function saveBoxesPositions(sDashBoxesId){
      var aDashBox=document.querySelectorAll("#"+ sDashBoxesId +" .dashBox");
      var iDashBox=aDashBox.length;
      var aBoxPositions=[],sSaveID,sDashBoxID;
      for(var i=0;i<iDashBox;i++){
        sDashBoxID=aDashBox[i].id;
        sSaveID="id"+ sDashBoxID.slice(sDashBoxID.lastIndexOf("_")+1);
        aBoxPositions.push(sSaveID);
      }
      localStorage["boxPositions_"+ FC360$.iStoreID +"_"+ sDashBoxesId]=aBoxPositions.join();
    }

    function fnCallbackReport(oHTTP,oDashBox){
      try{var oJSON=JSON.parse(oHTTP.responseText);}catch(e){var oJSON=null;}
      if(oJSON){
        if(oJSON.err=="ErrOK")showData(oJSON,oDashBox);
        else if(oJSON.err=="ErrNotLgo")FC360$.logoutUser();
        else console.log("Error executing report",oJSON);
      }
      else console.log("Error reading report",oJSON);
    }

    function showData(oJSON,oDashBox){
      var bIsOutdoor=(oJSON.report.chartType==TipoGraficoOutdoor);
      var oDivBody=document.createElement("div");
      oDivBody.className="dashBody"+ ((bIsOutdoor)?" dashOutdoor":"");
      var iRegs=oJSON.report.records;
      if(iRegs>0){
        var iChart=oJSON.report.chartType;
        if(iChart>=InicioGoogleCharts)google.charts.setOnLoadCallback(function(){callbackGoogleChart(oJSON,oDashBox,oDivBody);}); // chart
        else showList(oJSON,oDashBox,oDivBody); // list
      }
      else{ //no records
        oDivBody.innerHTML=XYZ[32][iLang$];
        oDivBody.classList.add("noData");
        createBox(oJSON,oDashBox,oDivBody);
      }
    }

    function createBox(oJSON,oDashBox,oDivBody){
      if(oDashBox.parentNode.parentNode){
        var sDashBoxesId=oDashBox.parentNode.parentNode.id;
        var sObjectID=oJSON.report.objectID;
        var sObjectName=oJSON.report.objectName;
        var iChart=oJSON.report.chartType;
        var sBoxIcons="<span class=boxIcons>"
        //report description
        var sReportDescription=oJSON.report.objectDescription;
        //sBoxIcons+="<a href=#na title='"+ sReportDescription +"' class=infoIcon>"
        //sBoxIcons+="<svg width=20 height=20 fill='#5992bb' viewBox='0 0 24 24'><path d='M0 0h24v24h-24z' fill='none'/><path d='M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 15h-2v-6h2v6zm0-8h-2v-2h2v2z'/></svg>";
        //sBoxIcons+="</a>";
        //go to report
        sBoxIcons+="<a href=#na onclick='dashBoxes$.viewReport("+ sObjectID +")' title='"+ XYZ[31][iLang$] +"'>"
        sBoxIcons+="<svg width=28 height=28 fill='#5992bb' viewBox='0 0 24 24'><path d='M19 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm-10 14h-2v-7h2v7zm4 0h-2v-10h2v10zm4 0h-2v-4h2v4z'/><path d='M0 0h24v24h-24z' fill='none'/></svg>";
        sBoxIcons+="</a>";
        //refresh box
        sBoxIcons+="<a href=#na onclick='dashBoxes$.refreshBox(this,"+ sObjectID +")' id=refresh_"+ sDashBoxesId +"_"+ sObjectID +" title='"+ XYZ[29][iLang$] +"'>"
        sBoxIcons+="<svg width=28 height=28 fill='#5992bb' viewBox='0 0 24 24'><path d='M17.65 6.35c-1.45-1.45-3.44-2.35-5.65-2.35-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78l-3.22 3.22h7v-7l-2.35 2.35z'/><path d='M0 0h24v24h-24z' fill='none'/></svg>";
        sBoxIcons+="</a>";
        //delete box
        sBoxIcons+="<a href=#na onclick='dashBoxes$.deleteBox(this)' title='"+ XYZ[30][iLang$] +"'>"
        sBoxIcons+="<svg width=28 height=28 fill='#5992bb' viewBox='0 0 24 24'><path d='M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z'/><path d='M0 0h24v24h-24z' fill='none'/></svg>";
        sBoxIcons+="</a>";
        sBoxIcons+="</span>"
        var oDivMain=document.createElement("div");
        oDivMain.className="dashMain";
        oDivMain.setAttribute("reportname",sObjectName);
        if(iChart>=InicioGoogleCharts)oDivMain.setAttribute("googlecharttype",aGoogleChartType[iChart-InicioGoogleCharts]);
        else if(iChart==TipoGraficoOutdoor)oDivMain.setAttribute("charttype","Outdoor");
        else oDivMain.setAttribute("charttype","none");
        var oDivHead=document.createElement("div");
        oDivHead.className="dashHead";
        if(oDashBox.draggable)oDivHead.classList.add("hasDrag");
        oDivHead.innerHTML="<span class=dashTitleName>"+ sObjectName +"</span>"+ sBoxIcons +"<div class=dashReportDescription>"+ sReportDescription +"</div>";
        oDashBox.innerHTML="";
        oDivMain.appendChild(oDivHead);
        oDivMain.appendChild(oDivBody);
        var oDivFoot=createBoxFoot(oDashBox);
        if(oDivFoot)oDivMain.appendChild(oDivFoot);
        oDashBox.appendChild(oDivMain);
        showPopBox(oDashBox);
      }
    }

    function createBoxFoot(oDashBox){
      var sSelectParam=oDashBox.getAttribute("selectparam");
      if(sSelectParam){
        var oSelectParam=JSON.parse(sSelectParam);
        var oDivFoot=document.createElement("div");
        oDivFoot.className="dashFoot";
        var oSpanParamName=document.createElement("span");
        oSpanParamName.className="dashFootParamName";
        oSpanParamName.innerHTML=oSelectParam.paramName;
        var oSelect=document.createElement("select");
        oSelect.className="dashFootParamOptions";
        oSelect.addEventListener("change",function(){changeSelectParam(this)},false);
        var aParamOptions=oSelectParam.paramOptions.split(";");
        var iSelectedItem=parseInt(oDashBox.getAttribute("selecteditem"));
        var iParamOptions=aParamOptions.length;
        for(var i=0;i<iParamOptions;i++){
          var option=document.createElement("option");
          option.text=aParamOptions[i];
          if(i==iSelectedItem)option.selected=true;
          oSelect.add(option);
        }
        oDivFoot.appendChild(oSpanParamName);
        oDivFoot.appendChild(oSelect);
      }
      else{
        var oDivFoot=document.createElement("div");
        oDivFoot.className="dashFoot";
        var oSpanParamName=document.createElement("span");
        oSpanParamName.className="dashFootParamName";
        oSpanParamName.innerHTML="";
        oDivFoot.appendChild(oSpanParamName);
      }
      //else var oDivFoot=null;
      return oDivFoot;
    }

    function changeSelectParam(oSelect){
      var oDashBox=oSelect.parentNode.parentNode.parentNode;
      var sDashBoxesId=oDashBox.parentNode.parentNode.id;
      oDashBox.setAttribute("selecteditem",oSelect.selectedIndex);
      var sObjectID=oDashBox.id.slice(oDashBox.id.lastIndexOf("_")+1);
      var oRefreshIcon=document.getElementById("refresh_"+ sDashBoxesId +"_"+ sObjectID);
      refreshBox(oRefreshIcon,sObjectID);
    }

    function showPopBox(oDashBox){
      oDashBox.classList.add("dashFullsize");
      oDashBox.classList.remove("dashThumb");
    }

    function callbackGoogleChart(oJSON,oDashBox,oDivBody){
      var sCustom=oJSON.report.chartCustom;
      var iChart=(oJSON.report.chartType)-InicioGoogleCharts;
      var aDataTable=[];
      aDataTable.push(oJSON.report.fields);
      FCAdm$.addChartColTypes(aDataTable,oJSON.report.fieldsTypes);
      aDataTable=aDataTable.concat(oJSON.report.data);
      var aChartTable=[];
      aChartTable=aChartTable.concat(aDataTable);
      FCAdm$.convertChartDateFields(aChartTable);
      var oGoogleData=google.visualization.arrayToDataTable(aChartTable);
      var oChartOptions={};
      if(sCustom!="")eval(sCustom);
      createBox(oJSON,oDashBox,oDivBody);
      var oChart=new google.visualization[aGoogleChartType[iChart]](oDivBody);
      oChart.draw(oGoogleData,oChartOptions);
    }

    function showList(oJSON,oDashBox,oDivBody){
      var aDataTable=[],aColumnTypes=[];
      aDataTable.push(oJSON.report.fields);
      FCAdm$.addChartColTypes(aDataTable,oJSON.report.fieldsTypes);
      aDataTable=aDataTable.concat(oJSON.report.data);
      getColumnTypes(oJSON,aColumnTypes);
      var oDivLista=document.createElement("div");
      oDivLista.className="dashList";
      var bIsOutdoor=(oJSON.report.chartType==TipoGraficoOutdoor);
      var oTable=FCAdm$.showTable(aDataTable,aColumnTypes,oDivLista,"",XYZ[28][iLang$],bIsOutdoor);
      if(!bIsOutdoor)FCAdm$.sortTable(oTable);
      createBox(oJSON,oDashBox,oDivBody);
      oDivBody.appendChild(oDivLista);
    }

    function getColumnTypes(oJSON,aColumnTypes){
      var sDBType;
      var aDBTypes=oJSON.report.dbTypes;
      var iDBTypes=aDBTypes.length;
      for(var i=0;i<iDBTypes;i++){
        sDBType=aDBTypes[i];
        var oItem={"type":sDBType,"hasTotal":(sDBType=="money" || sDBType=="real" || sDBType=="bigint")};
        aColumnTypes.push(oItem);
      }
    }
  }

  function viewReport(sObjectID){
    FC360$.showIDReportDetail(sObjectID);
  }

  function refreshBox(oLink,sObjectID){
    oLink.classList.add("infinityRotate");
    var oDashBox=oLink.parentNode.parentNode.parentNode.parentNode;
    var sSelectParam=oDashBox.getAttribute("selectparam");
    if(sSelectParam){
      var oSelectParam=JSON.parse(sSelectParam);
      var iSelectedItem=parseInt(oDashBox.getAttribute("selecteditem"));
    }
    else{
      var oSelectParam=null;
      var iSelectedItem=0;
    }
    var hasDrag=oDashBox.draggable;
    showDash(sObjectID,null,oDashBox,oSelectParam,iSelectedItem,hasDrag);
  }

  function deleteBox(oLink){
    var oDashBox=oLink.parentNode.parentNode.parentNode.parentNode;
    oDashBox.parentNode.removeChild(oDashBox);
  }

  return{
    sDashBoxes:sDashBoxes,
    sDashListReport:sDashListReport,
    sDashListDescription:sDashListDescription,
    sPar1:sPar1,sPar2:sPar2,sPar3:sPar3,sPar4:sPar4,sPar5:sPar5,sPar6:sPar6,sPar7:sPar7,sPar8:sPar8,
    initDashBoxes:initDashBoxes,
    viewReport:viewReport,
    refreshBox:refreshBox,
    deleteBox:deleteBox,
    hasDrag:hasDrag
  }
})();