using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Manifold.Interop;
using System.Configuration;
using System.IO;
using System.Drawing;

namespace ESRGC.GIS.WebMap.Maps.ImsServices
{
    public partial class wms : System.Web.UI.Page
    {
        protected void Page_Load(object sender, System.EventArgs e)
        {
            Session.Timeout = 2;//session time out = 2mins
            wmsRespond();
        }

        /// <summary>
        /// response to client wms request
        /// </summary>
        private void wmsRespond()
        {
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
            //create wms object
            IMapServerOgcWms wms = mapServer.CreateOgcWmsDriver();

            //handle custom parameter
            if (Request.QueryString["CustomParam"] != "")
            {
                string renderParam = Request.QueryString["CustomParam"];
                mapServer.set_RenderParameters("Selection", renderParam);
            }
            else
                mapServer.set_RenderParameters("Selection", "");

            //get server info
            string serverName = Request.ServerVariables["SERVER_NAME"];
            string serverPort = Request.ServerVariables["SERVER_PORT"];
            string URL = Request.ServerVariables["URL"];

            mapServer.Document.RefreshAllLinked();

            if (wms.Handle(Request.QueryString.ToString(), "http://" + serverName + ":" + serverPort + URL) == true)
            {
                Response.ContentType = wms.ResultContentType;
                if (wms.ResultContentType.IndexOf("image/") >= 0)
                {
                    var memStream = new MemoryStream(wms.Result);
                    var image = new Bitmap(memStream);
                    //make transparent and save to stream
                    image.MakeTransparent(System.Drawing.Color.Transparent);
                    //image.makeTransparentPNG(System.Drawing.Color.FromArgb(0));
                    var responseMemStream = new MemoryStream();
                    image.Save(responseMemStream, System.Drawing.Imaging.ImageFormat.Png);

                    Response.BinaryWrite(responseMemStream.ToArray());
                }
                else
                {
                    Response.Write(wms.Result);
                }
            }

            Response.End();
        }
    }
}