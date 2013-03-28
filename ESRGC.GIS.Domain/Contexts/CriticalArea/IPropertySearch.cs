using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace ESRGC.GIS.Domain.Contexts.CriticalArea
{
    public interface IPropertySearch
    {
        IEnumerable getPropertyAtAddress(string address, string zipCode, string county, string[] attributes);
        IEnumerable getPropertyAtXY(double x, double y, string county, string[] attributes);
        IEnumerable getPropertyWithId(string acctId, string county, string[] attributes);
        IEnumerable getPropertyWithTaxIdAndParcelNumber(string taxId, string parcelNumber, string county, string[] attributes);
    }
}
