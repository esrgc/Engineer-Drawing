using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using ESRGC.GIS.Domain.Contexts;
using ESRGC.GIS.Domain.DAL.Abstract;

namespace ESRGC.GIS.Domain.Contexts.CriticalArea
{
    public class ManifoldPropertySearch : ContextBase, IPropertySearch
    {
        public ManifoldPropertySearch(IRepository repository)
            : base(repository)
        { }



        #region IPropertySearch Members

        public IEnumerable getPropertyAtAddress(string address, string zipCode, string county, string[] attributes)
        {
            address = address.Replace(".", " ").ToUpper();
            address = address.Replace("  ", " ");
            address = address.TrimEnd(new char[] { ' ' });//trim
            //convert address suffix
            address = address.Replace(" ROAD", " RD");
            address = address.Replace(" LANE", " LN");
            address = address.Replace(" DRIVE", " DR");
            address = address.Replace(" STREET", " ST");
            address = address.Replace(" CIRCLE", " CIR");
            address = address.Replace(" AVENUE", " AVE");
            //construct query
            string query = string.Format(@"select CStr(CGeomWKB(Project(([Geom (I)]),CoordSys(""Map"" AS Component)))) as [Wkt],
                                               [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat
                                               (attributes)--Optional
                                               from [{2}] as [County] 
                                               where [County].[ADDRESS] = ""{0}""
                                               And [County].[ZIPCODE] = ""{1}""", address, zipCode, county);
            
            var result = getQueryData(query, attributes);
            if (result.Count() == 0)//if not found re-search in centroid table
            {
                query = string.Format(@"select CStr(CGeomWKB(Project(([Geom (I)]),CoordSys(""Map"" AS Component)))) as [Wkt],
                                        [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat                                       
                                        from [centroid] as [County] 
                                        where [County].[ADDRESS] = ""{0}""
                                        And [County].[ZIPCODE] = ""{1}""", address, zipCode);

                return getQueryData(query, new string[] { });
            }
            else
                return result;
        }

        public IEnumerable getPropertyAtXY(double x, double y, string county, string[] attributes)
        {
            var query = string.Format(@"SELECT CStr(CGeomWKB(Project(([Geom (I)]), CoordSys(""Map"" AS Component)))) as [Wkt],
                                        [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat
                                        (attributes)--Optional      
                                        From [{2}]
                                        where touches([{2}].[ID], 
                                        AssignCoordSys(NewPoint({0}, {1}),CoordSys(""Map"" AS Component)))", x, y, county);
            return getQueryData(query, attributes);

        }

        public IEnumerable getPropertyWithId(string acctId, string county, string[] attributes)
        {
            var query = string.Format(@"select CStr(CGeomWKB(Project(([Geom (I)]),CoordSys(""Map"" AS Component)))) as [Wkt],
                                        [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat
                                        (attributes)--Optional
                                        from [{1}] as [County] where [County].[ACCTID] = ""{0}""", acctId, county);
            var result = getQueryData(query, attributes);
            if (result.Count() == 0)//if not found re-search in centroid table
            {
                query = string.Format(@"select CStr(CGeomWKB(Project(([Geom (I)]),CoordSys(""Map"" AS Component)))) as [Wkt],
                                        [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat                                       
                                        from [centroid] as [County] where [County].[ACCTID] = ""{0}""", acctId);

                return getQueryData(query, new string [] {});
            }
            else
                return result;
        }

        public IEnumerable getPropertyWithTaxIdAndParcelNumber(string taxId, string parcelNumber, string county, string[] attributes)
        {
            string query = string.Format(@"select CStr(CGeomWKB(Project(([Geom (I)]),CoordSys(""Map"" AS Component)))) as [Wkt],
                                               [X (I)] as [X], [Y (I)] as [Y], [Longitude (I)] as Lon, [Latitude (I)] as Lat
                                               (attributes)--Optional
                                               from [{2}] as [County] 
                                               where [County].[Map] = ""{0}""
                                               And [County].[Parcel] = ""{1}""", taxId, parcelNumber, county);
            return getQueryData(query, attributes);
        }

        #endregion
    }
}
