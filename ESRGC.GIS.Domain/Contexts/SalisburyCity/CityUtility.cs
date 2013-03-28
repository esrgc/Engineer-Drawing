using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.DAL.Abstract;
using System.Collections;

namespace ESRGC.GIS.Domain.Contexts.SalisburyCity
{
    /// <summary>
    /// Provides query operations to get drawings using SQL server
    /// </summary>
    public class CityUtility : ContextBase, ICityUtility
    {
        public CityUtility(IRepository repo)
            : base(repo) {

        }

        #region IDrawing Members

        public IEnumerable getDrawingAtLocation(double x, double y, string[] attributes) {
            var query = string.Format(@"select [drw_id] as [DrawingId], 
                                            [FilePath].[drw_filepath] as [Path],
	                                        [drw_filename] as [FileName], 
                                            [Drawing].[contractId] as [ContractId],
	                                        [ContractNumber] as [ContractNumber]
                                            (attributes)--optional
                                        from 
                                        [DRAWING] left join [CONTRACT]
                                        on [DRAWING].[contractId] = [CONTRACT].[ContractId]
                                        left join [FilePath]
                                        on [DRAWING].[drw_filepathId] = [FilePath].[pathID]
                                        where 
                                            [contractId] in (select [CONTRACT].[ContractId] 
                                            from [SalisburyCity] join [CONTRACT]
                                            on [SalisburyCity].[CONTRACT] = [CONTRACT].[ContractNumber]
                                            where [Geom].STIntersects(geometry::STGeomFromText('POINT({0} {1})', 26985)) = 1)
                                            ORDER by [contractId]", x, y);
            return getQueryData(query, attributes);
        }

        public IEnumerable getContractAtLocation(double x, double y, string[] attributes) {
            var query = string.Format(@"select [CONTRACT].[ContractId] as [Id], 
                                               [ContractNumber] as [ContractNumber],
                                               [Contract].[ContractId] as [ContractID],
	                                           [Contract].[cnt_typswd] as [StormWater],
	                                           [Contract].[cnt_typsansew] as [Sanitary],
	                                           [Contract].[cnt_typwm] as [Water],
	                                           [Contract].[Status] as [Status]
                                                (attributes)--optional
                                        from [SalisburyCity] as [sc] join [CONTRACT]
                                        on [sc].[ContractId] = [CONTRACT].[ContractId]
                                        where [Geom].STIntersects(geometry::STGeomFromText('POINT({0} {1})', 26985)) = 1", x, y);
            return getQueryData(query, attributes);
        }

        public IEnumerable getDrawingByContract(string contractNumber, string[] attributes) {
            var query = string.Format(@"select [drw_id] as [DrawingId], 
                                            [FilePath].[drw_filepath] as [Path],
	                                        [drw_filename] as [FileName], 
                                            [Drawing].[contractId] as [ContractId],
	                                        [ContractNumber] as [ContractNumber]
                                            (attributes)--optional
                                    from 
                                    [DRAWING] left join [CONTRACT]
                                    on [DRAWING].[contractId] = [CONTRACT].[ContractId]
                                    left join [FilePath]
                                    on [DRAWING].[drw_filepathId] = [FilePath].[pathID]
                                    where [CONTRACT].[ContractNumber] = '{0}'", contractNumber);

            return getQueryData(query, attributes);
        }

        public IEnumerable getContractPolyById(int Id, string[] attributes) {
            var query = string.Format(@"select 
	                                        [CONTRACT].[ContractId] as [Id], 
                                            [ContractNumber],
                                            [Contract].[ContractId] as [ContractID],
	                                        [Contract].[StormWater] as [StormWater],
	                                        [Contract].[Sanitary] as [Sanitary],
	                                        [Contract].[Water] as [Water],
	                                        [Contract].[Status] as [Status],
	                                        [Geom].ToString() as [Wkt]
                                        from [SalisburyCity] as [sc] join [CONTRACT]
                                        on sc.[contractId] = [CONTRACT].[ContractId]
                                        and sc.[contractId] = {0}", Id);

            return getQueryData(query, attributes);
        }

        public IEnumerable getContractByGeom(string wkt, string system, string[] attributes) {
            string systemFilter = "";
            switch (system) {
                case "stormWater":
                    systemFilter = "and [StormWater] = 1";
                    break;
                case "sanitary":
                    systemFilter = "and [Sanitary] = 1";
                    break;
                case "water":
                    systemFilter = "and [Water] = 1";
                    break;
            }
            var query = string.Format(@"select 
	                                           [C].[ContractId], [C].[ContractNum],
	                                           [C].[StormWater],
	                                           [C].[Sanitary],
	                                           [C].[Water],
	                                           [C].[Status]
                                        from [SalisburyCity] as [sc] join [Contract] as [C]
                                        on [sc].[ContractId] = [C].[ContractId]
                                        where [Geom].STIntersects(geometry::STGeomFromText('{0}', 26985)) = 1
                                        {1}", wkt, systemFilter);
            return getQueryData(query, attributes);
        }
        public IEnumerable getContractPolygon(string[] attributes) {
            var query = string.Format(@"SELECT [ContractId],
                                           [Geom].ToString() as [Wkt]
                                           (attributes)--optional
                                    FROM [SalisburyCity]");
            return getQueryData(query, attributes);
        }
        public void addContract(string contractNo, 
                                int contractId,
                                DateTime date,
                                bool water,
                                bool stormWater,
                                bool sanitary,
                                string wkt) {
            var query = string.Format(@"
                            insert into 
                            [SalisburyCity]
                            (ContractNumber, PLY_DATE, TYP_SWD, TYP_SAN, TYP_WAT, ContractId, Geom) 
                            values(
	                            '{0}', '{1}', {2}, {3}, {4}, {5}, 
	                            geometry::STGeomFromText('{6}', 26985)
                            )", contractNo,
                              date,
                              stormWater ? 1: 0,
                              sanitary ? 1 : 0,
                              water ? 1: 0,
                              contractId,
                              wkt);
            RunNonQueryCmd(query);
        }

        public void editContract(int id, string[] attributes) {
            throw new NotImplementedException();
        }

        public void deleteContract(int id) {
            var query = @"Delete from [SalisburyCity] where ContractId = " + id;
            RunNonQueryCmd(query);
        }
        #endregion
    }
}
