using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using ESRGC.GIS.Domain.DAL.Abstract;

namespace ESRGC.GIS.Domain.Contexts.CriticalArea
{
    public class SqlPropertySearch : ContextBase, IPropertySearch
    {
        public SqlPropertySearch(IRepository repo)
            : base(repo)
        {

        }


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
            string query = string.Format(@"select [Geometry].ToString() as [Wkt] 
                                               (attributes)--Optional 
                                               from [{2}] as [County] 
                                               where [County].[ADDRESS] = '{0}'
                                               And [County].[ZIPCODE] = '{1}'", address, zipCode, county);

            var result = getQueryData(query, attributes);
            if (result.Count() == 0)//if not found re-search in centroid table
            {
                query = string.Format(@"select [Geometry].ToString() as [Wkt] 
                                        from [{2}centroid] as [County] 
                                        where [County].[ADDRESS] = '{0}'
                                        And [County].[ZIPCODE] = '{1}'", address, zipCode, county);

                return getQueryData(query, new string[] { });
            }
            else
                return result;
        }

        public IEnumerable getPropertyAtXY(double x, double y, string county, string[] attributes)
        {

            var query = string.Format(@"select [Geometry].ToString() as [Wkt] 
                                        (attributes)--Optional 
                                        from [{2}] as [County]
                                        where 
                                        [Geometry].STIntersects(geometry::STGeomFromText('POINT({0} {1})', 26985)) = 1;", x, y, county);
            return getQueryData(query, attributes);

        }

        public IEnumerable getPropertyWithId(string acctId, string county, string[] attributes)
        {
            var query = string.Format(@"select [Geometry].ToString() as [Wkt]
                                       (attributes)--Optional
                                        from [{1}] as [County] where [County].[ACCTID] = '{0}'", acctId, county);
            var result = getQueryData(query, attributes);
            
            if (result.Count() == 0)//if not found re-search in centroid table
            {
                query = string.Format(@"select [Geometry].ToString() as [Wkt]
                                        from [{1}Centroid] as [County] where [County].[ACCTID] = '{0}'", acctId, county);

                return getQueryData(query, new string[] { });
            }
            else
                return result;
        }

        public IEnumerable getPropertyWithTaxIdAndParcelNumber(string taxId, string parcelNumber, string county, string[] attributes)
        {
            string query = string.Format(@"select [Geometry].ToString() as [Wkt]
                                               (attributes)--Optional
                                               from [{2}] as [County] 
                                               where [County].[Map] = '{0}'
                                               And [County].[Parcel] = '{1}'", taxId, parcelNumber, county);
            return getQueryData(query, attributes);
        }

        #endregion
    }
}
