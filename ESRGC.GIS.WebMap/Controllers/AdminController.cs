using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using ESRGC.GIS.WebMap.Models;
using PagedList;

namespace ESRGC.GIS.WebMap.Controllers
{
    [Authorize(Roles = "admin")]
    public class AdminController : Controller
    {
        public AdminController() {
        }
        public ActionResult Index() {
            return View();
        }

    }
}
