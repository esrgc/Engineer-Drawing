using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.Contexts.CriticalArea;

namespace ESRGC.GIS.Domain.WorkUnits.Abstract
{
    public interface ICriticalAreaWorkUnit
    {
        IPropertySearch PropertySearch { get; }
        IJurisdiction Jurisdiction { get; }
    }
}
