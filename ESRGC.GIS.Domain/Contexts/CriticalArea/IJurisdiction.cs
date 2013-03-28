using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace ESRGC.GIS.Domain.Contexts.CriticalArea
{
    public interface IJurisdiction
    {
        IEnumerable getCountyList(string [] attributes);
        IEnumerable getTownList(int countyID, string[] attributes);
    }
}
