//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using ESRGC.GIS.Domain.Model.Geometry;

//namespace ESRGC.GIS.Domain.Extensions
//{
//    public static class WKTStringExtentions
//    {
//        public static List<List<List<MapPoint>>> toPolygonList(this string polygonWKT)
//        {
//            List<List<List<MapPoint>>> Polygons = new List<List<List<MapPoint>>>();
//            try
//            {
//                //parse the polygons
//                List<List<ESRGC.DataGeometry.Point>> polygonRings =
//                    ESRGC.DataGeometry.Geometry.parseMultiPolygonRings(polygonWKT);
//                List<List<MapPoint>> polygon = new List<List<MapPoint>>();
//                foreach (List<ESRGC.DataGeometry.Point> ring in polygonRings)
//                {
//                    List<MapPoint> pr = new List<MapPoint>();
//                    foreach (ESRGC.DataGeometry.Point p in ring)
//                    {
//                        pr.Add(new MapPoint(p.X, p.Y));
//                    }

//                    polygon.Add(pr);
//                }
//                Polygons.Add(polygon);

//                return Polygons;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception(polygonWKT, ex);
//            }
//        }
//        public static List<List<List<MapPoint>>> toPolylineList(this string linestringWKT)
//        {
//            List<List<List<MapPoint>>> LineStrings = new List<List<List<MapPoint>>>();
//            try
//            {
//                //parse the polygons
//                List<List<ESRGC.DataGeometry.Point>> linestr =
//                    ESRGC.DataGeometry.Geometry.parsePolyline(linestringWKT);
//                List<List<MapPoint>> line = new List<List<MapPoint>>();
//                foreach (List<ESRGC.DataGeometry.Point> ring in linestr)
//                {
//                    List<MapPoint> pr = new List<MapPoint>();
//                    foreach (ESRGC.DataGeometry.Point p in ring)
//                    {
//                        pr.Add(new MapPoint(p.X, p.Y));
//                    }

//                    line.Add(pr);
//                }
//                LineStrings.Add(line);

//                return LineStrings;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception(linestringWKT, ex);
//            }
//        }
//        public static List<MapPoint> toPointList(this string pointWKT)
//        {
//            List<MapPoint> points = new List<MapPoint>();
//            try
//            {
//                ESRGC.DataGeometry.Point point = ESRGC.DataGeometry.Geometry.parsePoint(pointWKT);
//                points.Add(new MapPoint(point.X, point.Y));
//                return points;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception(pointWKT, ex);
//            }
//        }
//    }
//}
