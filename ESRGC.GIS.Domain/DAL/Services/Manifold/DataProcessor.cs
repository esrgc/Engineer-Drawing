using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.Model.Geometry;
using System.Collections;
using ESRGC.GIS.Domain.Extensions;

namespace ESRGC.GIS.Domain.DAL.Services.Manifold
{
    /// <summary>
    /// data class that parses query data without any geometry coordinates
    /// Data returned from sources needs to be in IQueryable form (collection of dictionary)
    /// </summary>
    public class DataProcessor : IGeometryProcessor<QueryData>
    {

        #region IGeometryProcessor<GeoBase> Members

        public IEnumerable<QueryData> parseDataWithGraphic(IQueryable attributes) {
            throw new NotSupportedException("No graphic data supported in this class");
        }

        public IEnumerable<QueryData> parseData(IQueryable attributes) {
            var att = attributes as IQueryable<IDictionary>;

            foreach (IDictionary d in att) {
                var data = new QueryData() {
                    isValid = true,
                    Message = "OK",
                };

                data.Attributes = new List<IDictionary>() { d }.ToEnumerable();
                yield return data;
            }
        }

        #endregion
    }

}
