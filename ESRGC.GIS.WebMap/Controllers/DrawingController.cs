using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using ESRGC.GIS.Domain.Model;
using System.IO;
using ESRGC.GIS.WebMap.Models;
using ESRGC.GIS.WebMap.Utility;
using System.Drawing;
using System.Drawing.Imaging;

namespace ESRGC.GIS.WebMap.Controllers
{

    public class DrawingController : BaseController
    {
        public DrawingController(ISalisburyCityWorkUnit workUnit)
            : base(workUnit) {

        }
        //
        // GET: /Drawing/

        public ActionResult Index() {
            var drawings = _workUnit.DrawingRepository.Entities.Take(100).ToList();
            return View(drawings);
        }

        public ActionResult Detail(int id) {
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            var contract = _workUnit.ContractDrawingRepository
                .Entities.First(x => x.DrawingId == drawing.DrawingId).Contract;

            if (drawing != null) {
                var drawingData = new DrawingData() {
                    Drawing = drawing,
                    ImageUrl = Url.Action("DrawingById", new { id = id }),
                    Contract = contract
                };
                return View(drawingData);
            }
            //no drawing found
            updateTempDataMessage("No drawing with ID: " + id + " was found", null);
            return View();
        }
        [Authorize(Roles = "admin")]
        public ActionResult Edit(int id) {
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            var contractDrawing = _workUnit.ContractDrawingRepository.Entities
                .First(x => x.DrawingId == drawing.DrawingId);
            ViewBag.ContractId = contractDrawing.ContractId;
            ViewBag.ContractNum = contractDrawing.Contract.ContractNum;
            if (drawing != null) {
                return View(drawing);
            }
            //nothing was found
            updateTempDataMessage("No drawing with ID: " + id + " was found", null);
            return View();
        }
        [HttpPost]
        [ActionName("Edit")]
        [Authorize(Roles = "admin")]
        public ActionResult EditDrawing(int id, HttpPostedFileBase image) {
            var drawing = id == 0 ? new Drawing() : _workUnit.DrawingRepository.GetEntityByID(id);
            TryUpdateModel(drawing);
            try {
                //read uploaded image
                if (image != null) {
                    //after getting the file change the index date
                    drawing.DateLastIndexed = DateTime.Now;
                    //handle new file upload
                    processDrawingUpload(id, image);
                }
                if (ModelState.IsValid) {
                    //update to database
                    _workUnit.DrawingRepository.UpdateEntity(drawing);
                    _workUnit.SaveChanges();

                    updateTempDataMessage("Drawing updated", "success");
                    return RedirectToAction("Detail", new { id = id });
                }
            }
            catch {
                ModelState.AddModelError("", "Error updating drawing.");
            }
            //redisplay data
            var contractDrawing = _workUnit.ContractDrawingRepository.Entities
                .First(x => x.DrawingId == drawing.DrawingId);
            ViewBag.ContractId = contractDrawing.ContractId;
            ViewBag.ContractNum = contractDrawing.Contract.ContractNum;
            return View(drawing);
        }
        [Authorize(Roles = "admin")]
        public ActionResult Create(int contractId) {
            var drawing = new Drawing();
            ViewBag.ContractId = contractId;
            ViewBag.ContractNum = _workUnit.ContractRepository.GetEntityByID(contractId)
                .ContractNum;
            return View(drawing);
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        public ActionResult Create(int contractId, HttpPostedFileBase drawingImage) {
            var drawing = new Drawing();
            TryUpdateModel(drawing);
            if (drawingImage == null || drawingImage.ContentType != "image/tiff") {
                ModelState.AddModelError("", "Please select a drawing image file to upload. Only Tif image is supported.");
                ViewBag.ContractId = contractId;
                ViewBag.ContractNum = _workUnit.ContractRepository.GetEntityByID(contractId)
                .ContractNum;
                return View(drawing);
            }
            if (ModelState.IsValid) {
                //check contract ID
                if (contractId < 0)
                    throw new ArgumentException("contractId can't be less than 0");
                try {
                    var contract = _workUnit.ContractRepository.GetEntityByID(contractId);
                    //create file name and path for drawing
                    //var fileName = contract.ContractNum +
                    //    "_" + DateTime.Now.Ticks + //add time stamp (ticks)
                    //    ".tif";

                    drawing.FileName = getImgFileName(contract.ContractNum);
                    //process path based on drawing and contract property
                    var filePathStr = this.processFilePath(drawing, contractId);
                    //get path from database
                    FilePath path = null;
                    try {
                        path = _workUnit.FilePathRepository.Entities.First(x => x.Path == filePathStr);
                    }
                    catch {
                        path = new FilePath() { Path = filePathStr };
                        _workUnit.FilePathRepository.InsertEntity(path);
                        _workUnit.SaveChanges();//save changes to database
                    }

                    //store reference to path in drawing object
                    drawing.FilePathId = path.FilePathId;

                    //update date indexed
                    drawing.DateLastIndexed = DateTime.Now;
                    //drawing.DateLastRevised = DateTime.Today;
                    //insert drawing to database
                    _workUnit.DrawingRepository.InsertEntity(drawing);
                    _workUnit.SaveChanges();

                    //add references to contractDrawing table
                    var contractDrawing = new ContractDrawing() {
                        DrawingId = drawing.DrawingId,
                        ContractId = contractId
                    };
                    _workUnit.ContractDrawingRepository.InsertEntity(contractDrawing);
                    _workUnit.SaveChanges();

                    //handle upload drawing here
                    processDrawingUpload(drawing.DrawingId, drawingImage);
                    updateTempDataMessage("New drawing has been created successfully.",
                        "success");
                    return RedirectToAction("Detail", "Contract", new { id = contractId });
                }
                catch (Exception ex) {
                    ModelState.AddModelError("",
                        "Error processing new drawing. Please try again later. Error msg: " +
                        ex.Message);
                }
            }
            //something wrong redisplay the view
            ViewBag.ContractId = contractId;
            return View(drawing);
        }

        [Authorize(Roles = "admin")]
        public ActionResult Delete(int id) {
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            var contractDrawing = _workUnit.ContractDrawingRepository.Entities
                .First(x => x.DrawingId == drawing.DrawingId);
            ViewBag.ContractId = contractDrawing.ContractId;
            ViewBag.ContractNum = contractDrawing.Contract.ContractNum;
            ViewBag.ImageUrl = Url.Action("DrawingById", new { id = id });
            return View(drawing);
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        [ActionName("Delete")]
        public ActionResult DeleteDrawing(int id, int contractId) {
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            //delete image file
            try {
                //file path
                var filePath = _imagePath + "\\" + drawing.FilePath.Path + "\\" + drawing.FileName;

                FileInfo f = new FileInfo(filePath);
                if (f.Exists)//delete if already exists
                    f.Delete();                
                //delete reference to contract
                var contractRefs = _workUnit.ContractDrawingRepository
                    .Entities.Where(x => x.DrawingId == id);
                foreach(var contractRef in contractRefs)
                    _workUnit.ContractDrawingRepository.DeleteEntity(contractRef);
                //delete database record
                _workUnit.DrawingRepository.DeleteByID(id);
                _workUnit.SaveChanges();
                return RedirectToAction("Detail", "Contract", new { id = contractId});
            }
            catch {
                updateTempDataMessage("Error delete drawing. Please try again", "warning");
                return View(drawing);
            }
            
        }
        public FileContentResult DrawingById(int? id) {
            Drawing drawing = null;
            if (id == null)
                drawing = _workUnit.DrawingRepository.Entities.First();
            else
                drawing = _workUnit.DrawingRepository.GetEntityByID(id);

            var bitmapStream = new MemoryStream();

            var tiff = getImage(drawing);

            tiff.Save(bitmapStream, System.Drawing.Imaging.ImageFormat.Png);
            var binaryData = bitmapStream.GetBuffer();
            tiff.Dispose();
            bitmapStream.Close();
            return File(binaryData, "image/png");
        }
        /// <summary>
        /// generate pdf/png
        /// </summary>
        /// <param name="id">id of the drawing</param>
        /// <param name="orientation">paper orientation</param>
        /// <param name="x">x top coordinate</param>
        /// <param name="y">y top coordinate</param>
        /// <param name="selW">selection width</param>
        /// <param name="selH">selection height</param>
        /// <param name="scaledW">scaled width</param>
        /// <param name="scaledH">scaled height</param>
        /// <param name="download">option download</param>
        /// <returns>fileContentResult in specified format</returns>
        public ActionResult PartialDrawing(int? id, string orientation,
            int x, int y, int selW, int selH, int scaledW, int scaledH,
            bool? download, string format, float? marginTop, float? marginBottom,
            float? marginLeft, float? marginRight, string mode) {

            format = format ?? "png";
            download = download ?? false;
            orientation = orientation ?? "portrait";
            marginTop = marginTop ?? .25f;
            marginBottom = marginBottom ?? .25f;
            marginLeft = marginLeft ?? .25f;
            marginRight = marginRight ?? .25f;
            mode = mode ?? "fit";

            var pageOrientation = iTextSharp.text.PageSize.LETTER;
            if (orientation == "landscape")
                pageOrientation = iTextSharp.text.PageSize.LETTER.Rotate();
            Drawing drawing = null;
            if (id == null)
                drawing = _workUnit.DrawingRepository.Entities.First();
            else
                drawing = _workUnit.DrawingRepository.GetEntityByID(id);

            var tiff = getImage(drawing);

            //scale info
            var scaleX = ((double)scaledW / (double)tiff.Width);
            var scaleY = ((double)scaledH / (double)tiff.Height);

            var selectionW = (int)(selW / scaleX);
            var selectionH = (int)(selH / scaleY);
            var pixelX = (int)(x / scaleX);
            var pixelY = (int)(y / scaleY);

            //create bitmap
            Bitmap bmImage = new Bitmap(tiff);
            //crop image
            var croppedImage = ImageProcessor.cropImage(bmImage,
                new Rectangle(pixelX, pixelY, selectionW, selectionH));

            //result data
            byte[] binaryData = null;
            Stream bitmapStream = null;
            string mimeType = "";
            string downloadName = "";

            switch (format) {
                case "pdf":
                    bitmapStream = PdfProcessor.convertToPdf(drawing,
                        croppedImage,
                        pageOrientation,
                        mode,
                        marginTop.Value,
                        marginBottom.Value,
                        marginLeft.Value,
                        marginRight.Value);
                    binaryData = ((MemoryStream)bitmapStream).GetBuffer();
                    downloadName = drawing.FileName.Replace(".tif", "_")
                        + DateTime.Today.ToShortDateString() + "_"
                        + DateTime.Now.ToShortTimeString() + ".pdf";
                    mimeType = "application/pdf";
                    break;
                case "png":
                    //resize to fit the page
                    var resizedImage = ImageProcessor.resizeImage(croppedImage,
                        new Size((int)pageOrientation.Width, (int)pageOrientation.Height));
                    bitmapStream = new MemoryStream();
                    resizedImage.Save(bitmapStream, ImageFormat.Png);
                    binaryData = ((MemoryStream)bitmapStream).GetBuffer();
                    downloadName = drawing.FileName.Replace(".tif", "_")
                    + DateTime.Today.ToShortDateString() + ".png";
                    mimeType = "image/png";
                    //dispose resizeimage
                    resizedImage.Dispose();
                    break;
            }
            bitmapStream.Close();
            //dispose image objects
            tiff.Dispose();
            bmImage.Dispose();
            croppedImage.Dispose();

            //return
            if (download.Value)
                return File(binaryData, mimeType, downloadName);
            else
                return File(binaryData, mimeType);
        }


        public PartialViewResult Drawing(int? id) {
            if (id == null) {
                ModelState.AddModelError("ID", "No ID specified");
                return PartialView();
            }
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            var tiff = getImage(drawing);
            ViewBag.DrawingInfo = new {
                Width = tiff.Width,
                Height = tiff.Height,
                DpiX = tiff.HorizontalResolution,
                DpiY = tiff.VerticalResolution,
                //print paper pixel size using image dpi (resolution)
                LetterSizeW = (int)(8.5 * tiff.HorizontalResolution),
                LetterSizeH = (int)(11 * tiff.VerticalResolution)
            };
            ViewBag.DrawingImageUrl = Url.Action("DrawingById", "Drawing", new { id = id });
            tiff.Dispose();
            return PartialView(drawing);
        }
        private string processFilePath(Drawing drawing, int contractId) {
            var contract = _workUnit.ContractRepository.GetEntityByID(contractId);
            string path = "TIF\\";
            if (contract.Sanitary)
                path += "Sanitary_Sewers";
            else if (contract.StormWater)
                path += "Storm_Water_Drain";
            else if (contract.Water)
                path += "Water_Mains";
            else
                path += "LOV";
            if (drawing.Book.HasValue)
                path += @"\Book" + drawing.Book;

            var fullPath = _imagePath + "\\" + path;
            DirectoryInfo dInfo = new DirectoryInfo(fullPath);
            if (!dInfo.Exists)
                dInfo.Create();
            return path;
        }

        private void processDrawingUpload(int id, HttpPostedFileBase drwContent) {
            if (drwContent == null)
                throw new ArgumentNullException("No drawing image content was found");
            var drawing = _workUnit.DrawingRepository.GetEntityByID(id);
            var binaryData = new byte[drwContent.ContentLength];
            drwContent.InputStream.Read(binaryData, 0, drwContent.ContentLength);
            //file path
            var filePath = _imagePath + "\\" + drawing.FilePath.Path + "\\" + drawing.FileName;
            try {
                FileInfo f = new FileInfo(filePath);
                if (f.Exists)//delete if already exists
                    f.Delete();
                //open file and overwrite if exists
                using (var fileStream = f.Open(FileMode.CreateNew, FileAccess.Write, FileShare.None)) {
                    fileStream.Write(binaryData, 0, drwContent.ContentLength);
                    fileStream.Close();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
        }
        private string getImgFileName(string orgName) {
            var name = orgName + "_" +
                DateTime.Now.Ticks + ".tif";
            return name;
        }
    }
}
