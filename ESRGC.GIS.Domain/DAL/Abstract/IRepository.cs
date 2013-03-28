using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ESRGC.GIS.Domain.DAL.Abstract
{
    public interface IRepository
    {
        IQueryable Entities { get; }
        IQueryable getData(string query);
        void runNonQueryCmd(string query);
    }
}
