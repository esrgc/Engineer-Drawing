using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ESRGC.GIS.Domain.Model;

namespace ESRGC.GIS.WebMap.Models
{
    public class DrawingData
    {
        public Contract Contract { get; set; }
        public Drawing Drawing { get; set; }
        public string ImageUrl { get; set; }
    }
}