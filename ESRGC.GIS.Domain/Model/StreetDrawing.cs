using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ESRGC.GIS.Domain.Model
{
    public class StreetDrawing
    {
        public int StreetDrawingId { get; set; }
        public int? StreetId { get; set; }
        public virtual Street Street { get; set; }
        public int? DrawingId { get; set; }
        public virtual Drawing Drawing { get; set; }
    }
}
