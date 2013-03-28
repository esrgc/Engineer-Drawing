using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Manifold.Interop;
using System.Data;
using ESRGCManifoldWrapper;
using ESRGC.GIS.Domain.Model.Geometry;

namespace ESRGC.GIS.Domain.DAL.Services
{    /// <summary>
    /// This class is used to get data from SQL server and Manifold
    /// </summary>
    public class ManifoldDataManager
    {
        public List<Dictionary<string, object>> Attributes { get; set; }//data in tabular form used by SL app

        ManifoldWrapper _mw = null;
       
        /// <summary>
        /// Parse data from Manifold.Interop.ITable object into 
        /// Attributes (List<<Dictionary<string, object>> type)
        /// </summary>
        /// <param name="table">Manifold data table</param>
        public void parseAttributes(Table table)
        {
            try
            {
                Attributes = new List<Dictionary<string, object>>();
                // parse all the data and add to attributes
                foreach (Record r in table.RecordSet)
                {
                    Dictionary<string, object> dataRow = new Dictionary<string, object>();
                    foreach (Column c in table.ColumnSet)
                    {
                        dataRow.Add(c.Name, r.get_Data(c));

                    }
                    Attributes.Add(dataRow);
                }
            }
            catch
            { }
        }
        /// <summary>
        /// Create an instance of ManifoldWraper and Execute the query. 
        /// ManifoldWrapper instance is store in ASP.Net session state
        /// </summary>
        /// <param name="query">"select" query string</param>
        /// <param name="mapFile">Mapfile name (not full path, just the filename). 
        /// Full path will be parsed in the function</param>
        /// <returns>Manifold.Interop.ITable instance holding results</returns>
        public Table executeManifoldQuery(string query, string mapFile)
        {
            try
            {
                //get manifold instance
                if(_mw == null)
                    _mw = new ManifoldWrapper(mapFile);

                //execute query
                Table manifoldTable = _mw.getManifoldDataTable(query);

                return manifoldTable;
            }
            catch
            {
                throw new Exception("Error executing manifold query");
            }

        }
        
       

        public void executeManifoldUpdateQuery(string query, string mapFile)
        {
            try
            {
                //get manifold instance
                if (_mw == null)
                    _mw = new ManifoldWrapper(mapFile);
                
                //execute query
                _mw.updateQuery(query);
            }
            catch
            {
                throw new Exception("Error executing manifold query");
            }

        }
       
    }
   
}
