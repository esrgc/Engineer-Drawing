using System;
using System.Collections.Generic;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.Model.Geometry;
using ESRGC.GIS.Domain.DAL.Services.Manifold;
using ESRGC.GIS.Domain.Helpers;

namespace ESRGC.GIS.Domain.Contexts
{
    public class ContextBase : DataProcessor
    {
        IRepository _repository = null;

        public ContextBase(IRepository repo)
        {
            _repository = repo;
        }

        protected IEnumerable<QueryData> getQueryData(string query, string [] attributes)
        {
            if (string.IsNullOrEmpty(query))
                throw new ArgumentNullException("Query can not be null");
            //process extra attributes
            //build attributes for query
            string attributeString = HelperClass.buildAttributeString(attributes);
            //put attributes to the query
            query = query.Replace("(attributes)", attributeString);
            try
            {
                var data = _repository.getData(query);
                var parsedData = parseData(data);
                return parsedData;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        protected void RunNonQueryCmd(string query) {
            if (string.IsNullOrEmpty(query))
                throw new ArgumentNullException("Query can not be null");
           
            try {
                _repository.runNonQueryCmd(query);
            }
            catch (Exception ex) {
                throw ex;
            }
        }
    }
}
