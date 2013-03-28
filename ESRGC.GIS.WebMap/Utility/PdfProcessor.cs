using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;
using ESRGC.GIS.Domain.Model;
using iTextSharp.text.pdf;
using iTextSharp.text;

namespace ESRGC.GIS.WebMap.Utility
{
    public class PdfProcessor
    {

        public static Stream convertToPdf(Drawing drawing, Bitmap imageToConvert, iTextSharp.text.Rectangle size,
            string mode, float marginTop, float marginBottom, float marginLeft, float marginRight) {
            // creation of the document with a certain size and certain margins
            var document = new iTextSharp.text.Document(
                size, marginLeft, marginRight, marginTop, marginBottom);

            var memStream = new MemoryStream();
            // creation of the different writers
            iTextSharp.text.pdf.PdfWriter writer =
                iTextSharp.text.pdf.PdfWriter.GetInstance(document, memStream);

            // load the tiff image and count the total pages
            var bm = imageToConvert;
            //int total = bm.GetFrameCount(System.Drawing.Imaging.FrameDimension.Page);
            var dpi = 72f;
            document.Open();
            iTextSharp.text.pdf.PdfContentByte cb = writer.DirectContent;
            //add image
            //for (int k = 0; k < total; ++k) {
            //bm.SelectActiveFrame(System.Drawing.Imaging.FrameDimension.Page, k);
            //generate content
            iTextSharp.text.Image img = iTextSharp.text.Image.GetInstance(bm, System.Drawing.Imaging.ImageFormat.Tiff);
            if (mode == "fit") {
                img.ScaleAbsolute(document.PageSize.Width - (marginLeft + marginRight) * dpi,
                    document.PageSize.Height - (marginBottom + marginTop) * dpi);
            }
            else if (mode == "1to1") {
                // scale the image to fit in the page (image has to be in 300 dpi)
                var scalePercentage = dpi / img.DpiX * 100;
                img.ScalePercent(scalePercentage);//scale to fit 72 dpi
            }
            //set absolute position with margin (36px in 72dpi)
            img.SetAbsolutePosition(marginLeft * 72f, marginBottom * 72f);
            //add image to document
            cb.AddImage(img);
            var infoTable = generateInfoTemplate(drawing);
            
            infoTable.TotalWidth = document.PageSize.Width - (marginLeft + marginRight) * dpi;
            infoTable.WriteSelectedRows(0, -1, marginLeft * dpi, infoTable.TotalHeight + 18f, cb); 
            //document.NewPage();
            //}
            document.Close();

            return memStream;
        }
        ///
        //TO DO
        // implement info table for pdf drawing doc (template)
        ///

        private static PdfPTable generateInfoTemplate(Drawing drawing) {
            var table = new PdfPTable(10);
            table.AddCell("Page");
            table.AddCell("File name");
            table.AddCell("Last revised");
            table.AddCell("Last scanned");
            table.AddCell("Plan");
            table.AddCell("Detail");
            table.AddCell("Cross section");
            table.AddCell("Profile");
            table.AddCell("Elevation");
            table.AddCell("LOV");
            table.AddCell(drawing.SheetNumber.ToString());
            table.AddCell(drawing.FileName);
            if (drawing.DateLastIndexed.HasValue)
                table.AddCell(drawing.DateLastIndexed.Value.ToShortDateString());
            else
                table.AddCell("N/A");
            if(drawing.DateLastRevised.HasValue)
                table.AddCell(drawing.DateLastRevised.Value.ToString());
            else
                table.AddCell("N/A");
            table.AddCell(drawing.Plan ? "Yes" : "");
            table.AddCell(drawing.Detail ? "Yes" : "");
            table.AddCell(drawing.CrossSection ? "Yes" : "");
            table.AddCell(drawing.Profile ? "Yes" : "");
            table.AddCell(drawing.Elevation ? "Yes" : "");
            table.AddCell(drawing.LocationOfValve ? "Yes" : "");
            return table;
        }
    }
}