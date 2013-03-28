using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Manifold.Interop;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.ObjectModel;


namespace ESRGC.GIS.WebMap.Maps.ImsServices
{
    public class HelperFunction
    {
        /// <summary>
        /// Create manifold mapserver object
        /// </summary>
        /// <param name="mapFile"></param>
        /// <param name="component"></param>
        /// <param name="server"></param>
        /// <returns></returns>
        public static IMapServer createMapServer(string mapFile, string component, HttpServerUtility server)
        {
            try
            {
                IMapServer mapServer = new Manifold.Interop.MapServer();
                string config = composeConfig(mapFile, component, server);
                mapServer.CreateWithOpts(config, "", null, false);//always start up state
                return mapServer;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        /// <summary>
        /// compose config text for the mapserver
        /// </summary>
        /// <param name="mapfile"></param>
        /// <returns></returns>
        public static string composeConfig(string mapfile, string component, HttpServerUtility Server)
        {
            string serverMapPath = Server.MapPath(mapfile);
            string mapComponent = string.IsNullOrEmpty(component) ? "Map" : component;

            return string.Format(@"file={0}
                                   component={1}
                                   logo=false
                                   renderQuality = 80
                                   renderFormat = png
                                   refreshLinks=60", serverMapPath, mapComponent);
        }
    }

    public static class Transparency
    {
        public static void makeTransparentPNG(this Bitmap oldImage, System.Drawing.Color transparentColor)
        {
            for (int x = 0; x < oldImage.Width; x++)
            {
                for (int y = 0; y < oldImage.Height; y++)
                {
                    var currentColor = oldImage.GetPixel(x, y);
                    if (currentColor == transparentColor)
                        oldImage.SetPixel(x, y, System.Drawing.Color.Transparent);
                }
            }
        }
        /// <summary>
        /// for gif format
        /// </summary>
        /// <param name="oldImage"></param>
        /// <param name="transparentcolor"></param>
        /// <returns></returns>
        public static Bitmap makeTransparent(this Bitmap oldImage, System.Drawing.Color transparentcolor)
        {
            var bmp = new Bitmap(oldImage.Width, oldImage.Height, PixelFormat.Format8bppIndexed);
            var palette = bmp.Palette;
            Byte nextIndex = 0;
            var bmpData = bmp.LockBits(new Rectangle(0, 0, oldImage.Width, oldImage.Height), ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed);
            int index = 0;
            for (int i = 0; i <= 255; i++)
            {
                palette.Entries[i] = System.Drawing.Color.Empty;
            }
            for (int y = 0; y < oldImage.Height; y++)
            {
                for (int x = 0; x < oldImage.Width; x++)
                {
                    //Get the palette index of the current pixel
                    index = inPalette(palette, nextIndex - 1, oldImage.GetPixel(x, y));
                    if (index == -1)
                    {
                        palette.Entries[nextIndex] = oldImage.GetPixel(x, y);
                        index = nextIndex;
                        nextIndex++;
                    }
                    //set the pixel to the proper index
                    System.Runtime.InteropServices.Marshal.WriteByte(bmpData.Scan0, y * bmpData.Stride + x, ((byte)index));
                }
            }
            bmp.UnlockBits(bmpData);
            //if the specified transparent color is included in the palette, change that color to transparent
            if (transparentcolor != System.Drawing.Color.Empty && inPalette(palette, nextIndex - ((byte)1), transparentcolor) != -1)
            {
                palette.Entries[inPalette(palette, nextIndex - ((byte)1), transparentcolor)] = System.Drawing.Color.FromArgb(0, 0, 0, 0);

            }
            bmp.Palette = palette;
            return bmp;
        }

        private static int colorCount(Bitmap bmp)
        {
            var palette = new Collection<int>();
            int currentColor;
            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    currentColor = bmp.GetPixel(x, y).ToArgb();
                    if (!palette.Contains(currentColor))
                        palette.Add(currentColor);
                }
            }
            return palette.Count;
        }
        private static int inPalette(ColorPalette palette, int maxIndex, System.Drawing.Color colorToFind)
        {
            for (int i = 0; i < maxIndex; i++)
            {
                if (palette.Entries[i].ToArgb() == colorToFind.ToArgb())
                    return i;
            }
            return -1;
        }
    }

}

//Public Class Transparency
//        Public Shared Function MakeTransparent(ByVal oldbmp As Bitmap, ByVal transparentcolor As Color) As Bitmap
//            Dim bmp As New Bitmap(oldbmp.Width, oldbmp.Height, PixelFormat.Format8bppIndexed)
//            Dim palette As ColorPalette = bmp.Palette
//            Dim nextindex As Byte = 0
//            Dim bmpdata As BitmapData = bmp.LockBits(New Rectangle(0, 0, oldbmp.Width, oldbmp.Height), ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed)
//            Dim index As Integer
//            For i As Integer = 0 To 255
//                palette.Entries(i) = Color.Empty
//            Next
//            For y As Integer = 0 To oldbmp.Height - 1
//                For x As Integer = 0 To oldbmp.Width - 1
//                    'Get the palette index of the current pixel
//                    index = Transparency.InPalette(palette, nextindex - 1, oldbmp.GetPixel(x, y))
//                    'If the color is not in the palette, add it at the next unused index
//                    If index = -1 Then
//                        palette.Entries(nextindex) = oldbmp.GetPixel(x, y)
//                        index = nextindex
//                        nextindex += CByte(1)
//                    End If
//                    'Set the pixel to the proper index
//                    System.Runtime.InteropServices.Marshal.WriteByte(bmpdata.Scan0, y * bmpdata.Stride + x, CByte(index))
//                Next
//            Next
//            bmp.UnlockBits(bmpdata)
//            'If the specified transparent color is included in the palette, change that color to transparent
//            If transparentcolor <> Color.Empty AndAlso Transparency.InPalette(palette, nextindex - CByte(1), transparentcolor) <> -1 Then palette.Entries(Transparency.InPalette(palette, nextindex - CByte(1), transparentcolor)) = Color.FromArgb(0, 0, 0, 0)
//            bmp.Palette = palette
//            Return bmp
//        End Function

//        'Returns number of colors in bitmap
//        Public Shared Function ColorCount(ByVal bmp As Bitmap) As Integer
//            Dim palette As New Collections.ObjectModel.Collection(Of Integer)
//            Dim currcolor As Integer
//            For y As Integer = 0 To bmp.Height - 1
//                For x As Integer = 0 To bmp.Width - 1
//                    currcolor = bmp.GetPixel(x, y).ToArgb()
//                    If Not palette.Contains(currcolor) Then palette.Add(currcolor)
//                Next
//            Next
//            Return palette.Count
//        End Function

//        'Returns index of color in palette or -1
//        Private Shared Function InPalette(ByVal palette As ColorPalette, ByVal maxindex As Integer, ByVal colortofind As Color) As Integer
//            For i As Integer = 0 To maxindex
//                If palette.Entries(i).ToArgb() = colortofind.ToArgb() Then Return CInt(i)
//            Next
//            Return -1
//        End Function
//    End Class