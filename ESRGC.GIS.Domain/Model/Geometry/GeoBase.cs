using System.Collections.Generic;
using System.Collections;
using System.ComponentModel.DataAnnotations;

using ESRGC.GIS.Domain.Extensions;

namespace ESRGC.GIS.Domain.Model.Geometry
{
    public abstract class GeoBase
    {
        public bool isValid { get; set; }//indicates data is valid
        public string Message { get; set; }
        
        /// <summary>
        /// Data Attributes
        /// </summary>
        public IEnumerable Attributes { get; set; }
    }

    
}
