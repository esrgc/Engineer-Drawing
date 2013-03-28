using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Manifold.Interop;
using System.Configuration;

namespace ESRGC.GIS.WebMap.Maps.ImsServices
{
    public partial class legend : System.Web.UI.Page
    {
        protected void Page_Load(object sender, System.EventArgs e)
        {
            Response.ContentType = "image/png";
            Response.Expires = 0;
            Session.Timeout = 2;

            //access mapserver
            IMapServer mapServer;
            //create mapserver
            if (Session["mapServer"] == null)
            {
                try
                {
                    var mapFileName = ConfigurationManager.AppSettings["wmsMapFile"].ToString();
                    var component = Request.QueryString["component"];
                    //create map server
                    mapServer = HelperFunction.createMapServer(mapFileName, component, this.Server);
                    Session["mapServer"] = mapServer;
                }
                catch (NullReferenceException)
                {
                    throw new ArgumentNullException("wmsMapFile", "wmsMapFile is found in configuration settings");
                }

            }
            else
                mapServer = Session["mapServer"] as MapServer;

            //write legend image
            Response.BinaryWrite(mapServer.RenderLegend());

        }
    }
}