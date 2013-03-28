using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ESRGC.GIS.Domain.Model
{
    public class ContractDrawing
    {
        public int ContractDrawingId { get; set; }
        public int? ContractId { get; set; }
        public virtual Contract Contract { get; set; }
        public int? DrawingId { get; set; }
        public virtual Drawing Drawing { get; set; }
    }
}
