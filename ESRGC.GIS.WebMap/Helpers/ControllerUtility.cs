using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Collections;
using ESRGC.GIS.Domain.Model.Geometry;

namespace ESRGC.GIS.WebMap.Helpers
{
    public class ControllerUtility
    {
        /// <summary>
        /// function parses collection of type dictionary<geobase>
        /// </summary>
        /// <param name="inputData">IEnumerable type object containing Geobase base type</param>
        /// <returns>A list of dynamic objects as attributes</returns>
        public static List<dynamic> getQueryAttributes(IEnumerable inputData)
        {
            List<dynamic> dataList = new List<dynamic>();
            //cast input data to base type GeoBase which is the base class
            //for all custom geometry classes
            foreach (GeoBase data in inputData)
            {
                foreach (var attrObj in data.Attributes)
                {
                    dataList.Add(attrObj);
                }
            }

            return dataList;
        }

    }
}