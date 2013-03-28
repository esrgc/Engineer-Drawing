using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using ESRGC.GIS.Domain.DAL.Abstract;
using System.Data.SqlClient;
using System.Data;
using System.Collections;

namespace ESRGC.GIS.Domain.DAL.Concrete
{
    public class SqlRepository : IRepository
    {
        SqlConnection _connection = null;
        List<Dictionary<string, object>> _data = null;
        public SqlRepository(string connectionString) {
            _connection = new SqlConnection(connectionString);
        }
        #region IEntitiesRepository Members

        public IQueryable Entities {
            get { return _data.AsQueryable(); }
        }

        public IQueryable getData(string query) {
            try {
                _connection.Open();
                DataTable table = new DataTable();
                using (SqlCommand queryCmd = new SqlCommand(query, _connection)) {
                    SqlDataReader reader = queryCmd.ExecuteReader();
                    table.Load(reader);
                    reader.Close();
                }
                var attributes = parseAttributes(table);
                _data = attributes;
                return attributes.AsQueryable();
            }
            catch (Exception ex) {
                throw ex;
            }
            finally {
                _connection.Close();
            }
        }
        /// <summary>
        /// insert/update/delete query
        /// </summary>
        /// <param name="query">query to execute</param>
        public void runNonQueryCmd(string query) {
            try {
                _connection.Open();
                DataTable table = new DataTable();
                using (SqlCommand queryCmd = new SqlCommand(query, _connection)) {
                    queryCmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
            finally {
                _connection.Close();
            }
        }
        #endregion

        /// <summary>
        /// Parse data from ADO.Net datatable to Attributes 
        /// (List<Dictionary<string, object>> type)
        /// </summary>
        /// <param name="table">ADO.Net data table</param>
        private List<Dictionary<string, object>> parseAttributes(DataTable table) {

            var attributes = new List<Dictionary<string, object>>();
            try {
                foreach (DataRow r in table.Rows) {
                    var dataRow = new Dictionary<string, object>();
                    foreach (DataColumn dc in table.Columns) {
                        var data = r[dc];
                        if (data is string)
                            data = data.ToString().Trim();
                        dataRow.Add(dc.ColumnName, data);
                    }
                    attributes.Add(dataRow);
                }

                return attributes;
            }
            catch (Exception ex) {
                throw ex;
            }
        }




    }
}
