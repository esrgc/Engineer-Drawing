using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;
using iTextSharp;
using System.Drawing.Drawing2D;

namespace ESRGC.GIS.WebMap.Utility
{
    /// <summary>
    /// Contains Utility functions to process tiff images
    /// </summary>
    public class ImageProcessor
    {
        
        /// <summary>
        /// crope image
        /// </summary>
        /// <param name="sourceImg">Image to be cropped</param>
        /// <param name="cropSize">rectangle represents crop size</param>
        /// <returns>cropped image</returns>
        public static Bitmap cropImage(Image sourceImg, Rectangle cropSize) {
            var sourceBitmap = new Bitmap(sourceImg);
            var croppedImage = sourceBitmap.Clone(
                new Rectangle(cropSize.X, cropSize.Y, cropSize.Width, cropSize.Height),
                sourceBitmap.PixelFormat);
            croppedImage.SetResolution(300, 300);
            //var croppedImage = new Bitmap(cropSize.Width, cropSize.Height);
            //using (Graphics g = Graphics.FromImage(croppedImage))
            //{
            //    g.DrawImage(sourceBitmap,
            //                new Rectangle(0, 0, croppedImage.Width, croppedImage.Height),
            //                cropSize,
            //                GraphicsUnit.Pixel);
            //}
            return croppedImage;
        }
        public static Image resizeImage(Image imgToResize, Size size) {
            int sourceWidth = imgToResize.Width;
            int sourceHeight = imgToResize.Height;

            float nPercent = 0;
            float nPercentW = 0;
            float nPercentH = 0;

            nPercentW = ((float)size.Width / (float)sourceWidth);
            nPercentH = ((float)size.Height / (float)sourceHeight);

            if (nPercentH < nPercentW)
                nPercent = nPercentH;
            else
                nPercent = nPercentW;

            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);

            Bitmap b = new Bitmap(destWidth, destHeight);
            Graphics g = Graphics.FromImage((Image)b);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;

            g.DrawImage(imgToResize, 0, 0, destWidth, destHeight);
            g.Dispose();

            return (Image)b;
        }
    }
}