using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using PagedList;

namespace ESRGC.GIS.WebMap.Models
{
    public class PagedListCollection<TModel>
    {
        public IPagedList<TModel> Collection { get; set; }
    }
}