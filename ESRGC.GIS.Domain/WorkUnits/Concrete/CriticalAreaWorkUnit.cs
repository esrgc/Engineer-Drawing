using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using System.Data;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.Contexts.CriticalArea;

namespace ESRGC.GIS.Domain.WorkUnits.Concrete
{
    public class CriticalAreaWorkUnit : ICriticalAreaWorkUnit
    {
        IRepository _repo = null;
        IPropertySearch _propertySearch = null;
        IJurisdiction _jurisdiction = null;
        
        public CriticalAreaWorkUnit(IRepository repo)
        {
            _repo = repo;
        }

        #region ICriticalAreaWorkUnit Members

        public IPropertySearch PropertySearch
        {
            get
            {
                return _propertySearch ?? new SqlPropertySearch(_repo);
            }
        }


        public IJurisdiction Jurisdiction
        {
            get { return _jurisdiction ?? new Jurisdiction(_repo); }
        }

        #endregion
    }
}
