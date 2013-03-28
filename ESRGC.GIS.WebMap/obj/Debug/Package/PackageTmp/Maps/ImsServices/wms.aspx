<%@ Page Language="C#" CodeBehind="wms.aspx.cs" Inherits="ESRGC.GIS.WebMap.Maps.ImsServices.wms" %>
<html>
	<head>
		<title>OGC WMS Error</title>
	</head>
	<body>
		<p>Error executing OGC WMS query: <%= Request.QueryString %></p>
	</body>
</html>
