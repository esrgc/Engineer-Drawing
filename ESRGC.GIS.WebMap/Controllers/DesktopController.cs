using System.Linq;
using System.Web.Mvc;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using ESRGC.GIS.WebMap.Helpers;
using ESRGC.GIS.Domain.Model;
using System.Drawing;

namespace ESRGC.GIS.WebMap.Controllers
{
    public class DesktopController : BaseController
    {

        public DesktopController(ISalisburyCityWorkUnit workUnit)
            : base(workUnit) {

        }
        #region action methods
        public ViewResult Index() {
            return View();
        }

        public JsonResult ContractByGeometry(string wkt, string system) {
            var result = _workUnit.CityUltilities.getContractByGeom(wkt, system, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        public JsonResult ContractAtLocation(double x, double y) {
            var result = _workUnit.CityUltilities.getContractAtLocation(x, y, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);

            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult DrawingAtLocation(double x, double y) {
            var result = _workUnit.CityUltilities.getDrawingAtLocation(x, y, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);

            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult DrawingByContract(string contractNumber) {
            var result = _workUnit.CityUltilities.getDrawingByContract(contractNumber, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);

            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityContracts() {
            var result = _workUnit.CityUltilities.getContractPolygon(new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public ActionResult test1(int? id, int x, int y, int selW, int selH, int scaledW, int scaledH) {
            Drawing drawing = null;
            if (id == null)
                drawing = _workUnit.DrawingRepository.Entities.First();
            else
                drawing = _workUnit.DrawingRepository.GetEntityByID(id);

            var physicalPath = _imagePath + "\\" + drawing.FilePath.Path + "\\" + drawing.FileName;
            var tiff = Bitmap.FromFile(physicalPath);

            //print paper pixel size using image dpi (resolution)
            int pixelW = (int)(8.5 * tiff.HorizontalResolution);
            int pixelH = (int)(11 * tiff.VerticalResolution);

            //scale info
            var scaleX = ((double)scaledW / (double)tiff.Width);
            var scaleY = ((double)scaledH / (double)tiff.Height);

            var selectionW = (int)(selW / scaleX);
            var selectionH = (int)(selH / scaleY);
            var pixelX = (int)(x / scaleX);
            var pixelY = (int)(y / scaleY);

            var result = new {
                x = x,
                y = y,
                selW = selW,
                selH = selH,
                scaledW = scaledW,
                scaledH = scaledH,
                W = tiff.Width,
                H = tiff.Height,
                paperW = drawing.PaperWidth,
                paperH = drawing.PaperHeight,
                scaleX = scaleX,
                scaleY = scaleY,
                selectionW = selectionW,
                selectionH = selectionH,
                pixelX = pixelX,
                pixelY = pixelY,
                letterW = pixelW * scaleX,
                letterH = pixelH * scaleY,
                paperSize = iTextSharp.text.PageSize.LETTER

            };

            return Json(result, JsonRequestBehavior.AllowGet);
        }
        

        //public FileContentResult DrawingPdf(int? id)
        //{
        //    Drawing drawing = null;
        //    if (id == null)
        //        drawing = _workUnit.DrawingRepository.Entities.First();
        //    else
        //        drawing = _workUnit.DrawingRepository.GetEntityByID(id);
        //    var physicalPath = _imagePath + "\\" + drawing.FilePath.Path + "\\" + drawing.FileName;

        //    var bitmapStream = ImageProcessor.convertToPdf(physicalPath, iTextSharp.text.PageSize.LETTER);
        //    var binaryData = (bitmapStream as MemoryStream).GetBuffer();
        //    bitmapStream.Close();
        //    return File(binaryData, "application/pdf");
        //}
        #endregion

    }
}
