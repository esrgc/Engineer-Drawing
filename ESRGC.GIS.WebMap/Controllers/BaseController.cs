using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ESRGC.GIS.WebMap.Models;
using System.Web.UI.WebControls;
using System.Drawing;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using PagedList;
using System.Configuration;

namespace ESRGC.GIS.WebMap.Controllers
{
    public class BaseController : Controller
    {
        protected ISalisburyCityWorkUnit _workUnit = null;
        protected string _imagePath = ""; //drawing image path
        
        public BaseController(ISalisburyCityWorkUnit workUnit) {
            _workUnit = workUnit;
            _imagePath = ConfigurationManager.AppSettings["drawingImagePath"].ToString();
        }

        protected void updateTempDataMessage(string message, string type)
        {
            TempData["message"] = message;
            TempData["type"] = type;
        }
        
        #region privates
        ///Private functions
        protected ContractData getContractDetailById(int id, int? page, int? pageSize) {
            //get contract
            var contract = _workUnit.ContractRepository.GetEntityByID(id);
            //get drawings associated with this contract (many to many relationship)
            var drawings = _workUnit.ContractDrawingRepository.Entities
                .Where(x => x.ContractId == id)
                .Select(x => x.Drawing);
            drawings = drawings.OrderBy(x => x.DrawingId);//order by id
            //set default page size if not found in request
            var currentPageSize = pageSize ?? 5;
            int pageIndex = (page ?? 1);
            //generate result
            var result = new ContractData() {
                Contract = contract,
                Drawings = drawings.ToPagedList(pageIndex, currentPageSize)
            };
            ViewBag.currentPageSize = currentPageSize;
            return result;
        }
        protected System.Drawing.Image getImage(Domain.Model.Drawing drawing) {
            var physicalPath = _imagePath + "\\" + drawing.FilePath.Path + "\\" + drawing.FileName;
            var tiff = Bitmap.FromFile(physicalPath);
            return tiff;
        }
        #endregion

    }
}
