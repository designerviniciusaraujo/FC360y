/* Global options */

const IdiomaBR$=0,IdiomaUS$=1,
      iLang$=IdiomaBR$, //interface language. 0=pt-br 1=en-us
      sLocale$=(iLang$==IdiomaBR$?"pt-BR":"en-US"),
      aGoogleChartType=["AreaChart","BarChart","PieChart","Gauge","ColumnChart","Histogram","ComboChart","LineChart","GeoChart"],InicioGoogleCharts=23,TipoGraficoOutdoor=1; /* Graph type vars */

var FCAdmVars$={
  isTest:true, /* True to connect to test environment */
  sURLAdm360:null, /* Backoffice URL */
  sCompanyName:"Rumo Web",
  sCompanySite:"https://www.fastcommerce.com.br/",
  sBrand:"Fastcommerce",
  iVersion:9.1,
  IdiomaAdm:iLang$,
  offlineRetryTime:1000, /* Offline retry time in milliseconds */
  dashboardWait:100, /* Wait time in milliseconds between each dashbord call */
  dsh:6, /* max dashboxes */
  loadingIcon:"<div id='fc-loading-container'><img class='fc-loading-icon' src=images/icon-dashboard-loading.svg width='25' height='25'></div>",
  aSearchType:[]
}

FCAdmVars$.sURLAdm360=(FCAdmVars$.isTest?"https://mmm6.fastcommerce.com.br":"https://www.rumo.com.br");
FCAdmVars$.dashboardWait=(FCAdmVars$.isTest?500:100);
FCAdmVars$.dsh=(FCAdmVars$.isTest?99:6);