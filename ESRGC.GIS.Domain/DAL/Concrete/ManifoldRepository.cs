using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.DAL.Services;
using Manifold.Interop;
using System.Collections;

namespace ESRGC.GIS.Domain.DAL.Concrete
{
    public class ManifoldRepository: IRepository
    {
        string _mapFilePath;
        public ManifoldRepository(string mapFilePath)
        {
            _mapFilePath = mapFilePath;
            _dataManager = new ManifoldDataManager() { Attributes = new List<Dictionary<string, object>>() };
        }

        private ManifoldDataManager _dataManager;

        #region IEntitiesRepository<T> Members

        public IQueryable Entities
        {
            get { return _dataManager.Attributes.AsQueryable(); }
        }



        /// <summary>
        /// Get data in List<Dictionary<string, object>> type from manifold with provided mapfile name
        /// </summary>
        /// <param name="query">query to be executed</param>
        /// <returns>IQueryable type result</returns>
        public IQueryable getData(string query)
        {
            try
            {
                Table table = _dataManager.executeManifoldQuery(query, _mapFilePath);
                _dataManager.parseAttributes(table);

                return _dataManager.Attributes.AsQueryable();
            }
            catch
            {
                return null;
            }
        }

        public void runUpdateQuery(string query)
        {
            _dataManager.executeManifoldUpdateQuery(query, _mapFilePath);
        }
        #endregion


        public void runNonQueryCmd(string query) {
            throw new NotImplementedException();
        }
    }
}
