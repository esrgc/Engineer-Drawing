using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace ESRGC.GIS.Domain.Contexts.SalisburyCity
{
    public interface ICityUtility
    {
        IEnumerable getContractAtLocation(double x, double y, string[] attributes);
        IEnumerable getContractByGeom(string wkt, string system, string[] attributes);
        IEnumerable getContractPolygon(string[] attributes);
        IEnumerable getDrawingByContract(string contractNumber, string[] attributes);
        IEnumerable getDrawingAtLocation(double x, double y, string[] attributes);
        IEnumerable getContractPolyById(int Id, string[] attributes);
        void addContract(string contractNo,
                                int contractId,
                                DateTime date,
                                bool water,
                                bool stormWater,
                                bool sanitary,
                                string wkt);
        void editContract(int id, string[] attributes);
        void deleteContract(int id);


    }
}
