using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.Model.Geometry;

namespace ESRGC.GIS.Domain.DAL.Services.Manifold
{
    public interface IGeometryProcessor<T>
    {
        IEnumerable<T> parseDataWithGraphic(IQueryable attributes);
        IEnumerable<T> parseData(IQueryable attributes);
    }
}
