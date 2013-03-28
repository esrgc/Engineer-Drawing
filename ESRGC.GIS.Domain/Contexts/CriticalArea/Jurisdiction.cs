using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.DAL.Abstract;
using System.Collections;

namespace ESRGC.GIS.Domain.Contexts.CriticalArea
{
    public class Jurisdiction : ContextBase, IJurisdiction
    {
        public Jurisdiction(IRepository repository)
            : base(repository)
        { }

        #region IJurisdiction Members

        public IEnumerable getCountyList(string [] attributes)
        {
            var query = string.Format(@"select [CountyID], [Name], [Description] as [Status],
	                                           [Extent], [StreetMapWmsLayers],
	                                           [ImageryWmsLayers], [MapComponent], [DataAvailable]
                                        from [County]
                                        left join [status]
                                        on [County].[StatusID] = [status].[StatusID]
                                        order by [County].[Name]");
            return getQueryData(query, attributes);
        }

        public IEnumerable getTownList(int countyID, string[] attributes)
        {
            var query = string.Format(@"select [TownID], [CountyID], [Name], [Description] as [Status],
                                               [Extent]
                                        from [Town]
                                        left join [status]
                                        on [Town].[StatusID] = [status].[StatusID]
                                        where [CountyID] = {0}", countyID);
            return getQueryData(query, attributes);
        }

        #endregion
    }
}
