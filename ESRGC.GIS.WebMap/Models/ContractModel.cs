using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using PagedList;
using ESRGC.GIS.Domain.Model;

namespace ESRGC.GIS.WebMap.Models
{
    public class ContractData
    {
        public IPagedList<Drawing> Drawings { get; set; }
        public Contract Contract { get; set; }
    }
}