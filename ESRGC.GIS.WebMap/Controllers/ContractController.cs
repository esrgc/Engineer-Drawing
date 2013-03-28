using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using ESRGC.GIS.WebMap.Models;
using ESRGC.GIS.Domain.Model;
using PagedList;
using ESRGC.GIS.WebMap.Helpers;
using System.IO;
using System.Data.Entity;

namespace ESRGC.GIS.WebMap.Controllers
{

    public class ContractController : BaseController
    {
        int _pageSize = 10;
        public ContractController(ISalisburyCityWorkUnit workUnit)
            : base(workUnit) {

        }
        //
        // GET: /Contract/
        [Authorize(Roles = "admin")]
        public ActionResult Index(string searchString, string currentFilter, int? page) {
            if (Request.HttpMethod == "GET") {
                searchString = currentFilter;
            }
            else {
                page = 1;
            }
            ViewBag.CurrentFilter = searchString;
            int pageIndex = (page ?? 1);

            var contracts = _workUnit.ContractRepository.Entities.ToList();
            if (!string.IsNullOrEmpty(searchString))
                contracts = contracts.Where(x => x.ContractNum.ToUpper()
                    .Contains(searchString.ToUpper()))
                    .OrderByDescending(x => x.ContractId)
                    .ToList();

            return View(new PagedListCollection<Contract>() { Collection = contracts.ToPagedList(pageIndex, _pageSize) });
        }
        //
        // Detail
        [Authorize(Roles = "admin")]
        public ActionResult Detail(int id, int? page) {
            var contract = _workUnit.ContractRepository.GetEntityByID(id);
            if (contract == null) {
                ModelState.AddModelError("", "Contract with Id " + id + " not found.");
                return View();
            }
            var contractData = getContractDetailById(id, page, _pageSize);
            ViewBag.Action = "Detail";//used to render paging navigation in drawing listing
            return View(contractData);
        }
        //
        //Create (insert)
        [Authorize(Roles = "admin")]
        public ActionResult Create() {
            return View(new Contract());
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        public ActionResult Create(string[] wkts) {
            var contract = new Contract();
            TryUpdateModel(contract);
            try {
                if (ModelState.IsValid) {
                    //store contract data
                    _workUnit.ContractRepository.InsertEntity(contract);
                    _workUnit.SaveChanges();//store to database
                    //store geometry
                    if (wkts != null) {
                        foreach (var wkt in wkts) {
                            _workUnit.CityUltilities.addContract(
                               contract.ContractNum,
                               contract.ContractId,
                               DateTime.Now,
                               contract.Water,
                               contract.StormWater,
                               contract.Sanitary,
                               wkt
                           );
                        }
                    }
                    //update status
                    updateTempDataMessage("New contract has been created", "success");
                    return RedirectToAction("Detail", new { id = contract.ContractId });
                }
            }
            catch (Exception ex) {
                ModelState.AddModelError("", "Error creating new contract. " + ex.Message);
            }

            ViewBag.Wkts = wkts;
            //something wrong return current view
            return View(contract);
        }
        //
        //update (edit)
        [Authorize(Roles = "admin")]
        public ActionResult Edit(int id) {
            var contract = _workUnit.ContractRepository.GetEntityByID(id);
            var result = _workUnit.CityUltilities.getContractPolyById(id, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);
            List<string> wkts = new List<string>();
            foreach (var obj in data) {
                wkts.Add(obj.Wkt as string);
            }
            ViewBag.Wkts = wkts;
            return View(contract);
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        public ActionResult Edit(int contractId, string[] wkts) {
            var contract = contractId == 0 ? new Contract() :
                _workUnit.ContractRepository.GetEntityByID(contractId);
            TryUpdateModel(contract);
            try {
                if (ModelState.IsValid) {
                    //do update
                    _workUnit.ContractRepository.UpdateEntity(contract);
                    _workUnit.SaveChanges();
                    //update geometry
                    //delete existing polygons
                    _workUnit.CityUltilities.deleteContract(contractId);
                    if (wkts != null) {
                        //add new polygons
                        foreach (var wkt in wkts) {
                            _workUnit.CityUltilities.addContract(
                               contract.ContractNum,
                               contract.ContractId,
                               DateTime.Now,
                               contract.Water,
                               contract.StormWater,
                               contract.Sanitary,
                               wkt
                           );
                        }
                    }
                    //report back 
                    updateTempDataMessage("Contract data updated.", "success");
                    //redirect back to detail
                    return RedirectToAction("detail", new { id = contractId });
                }
            }
            catch (Exception ex) {
                ModelState.AddModelError("", "Error updating contract. " + ex.Message);
            }
            ViewBag.Wkts = wkts;
            //something wrong redisplays
            return View(contract);
        }
        //
        //Delete
        [Authorize(Roles = "admin")]
        public ActionResult Delete(int id) {
            var contract = _workUnit.ContractRepository.GetEntityByID(id);
            ViewBag.DrawingFiles = _workUnit.ContractDrawingRepository.Entities
                .Where(x => x.ContractId == id).Select(x => x.Drawing.FileName);
            if (contract != null)
                return View(contract);
            else
                return View("Error");
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        public ActionResult Delete(int id, bool? deleteDrawing) {
            var contract = _workUnit.ContractRepository.GetEntityByID(id);
            if (contract != null) {
                //find drawing references
                var contractDrawings =
                        _workUnit.ContractDrawingRepository.Entities
                        .Where(x => x.ContractId == id);
                if (deleteDrawing.HasValue && deleteDrawing.Value) {
                    //find drawings associated with this contract
                    var drawings = contractDrawings.Select(x => x.Drawing)
                        .Include(x => x.FilePath);
                    if (drawings.Count() > 0) {
                        //delete drawing files
                        foreach (var drawing in drawings) {
                            //file path
                            var path = _imagePath + "\\" +
                                drawing.FilePath.Path +
                                "\\" + drawing.FileName;
                            //delete actual file
                            var fileInfo = new FileInfo(path);
                            if (fileInfo.Exists)
                                fileInfo.Delete();//delete the file                            
                        }
                        //delete database record
                        foreach (var drawing in drawings)
                            _workUnit.DrawingRepository.DeleteEntity(drawing);
                    }
                }
                //delete contract record
                _workUnit.ContractRepository.DeleteEntity(contract);
                _workUnit.SaveChanges();
                //delete drawing references
                foreach (var contractDrawingRef in contractDrawings)
                    _workUnit.ContractDrawingRepository.DeleteEntity(contractDrawingRef);
                //commit to database
                _workUnit.SaveChanges();
                //delete contract polygon
                _workUnit.CityUltilities.deleteContract(id);
                updateTempDataMessage("Contract " + contract.ContractNum + " has been deleted.", "success");
                return RedirectToAction("Index");
            }
            else
                return View("Error");
        }

        /*non-authorized action methods*/
        public PartialViewResult Contract(int id, int? page, int? pageSize) {
            ViewBag.Action = "Contract";//used to render paging navigation in drawing listing
            var result = getContractDetailById(id, page, pageSize);
            return PartialView(result);
        }

        /// <summary>
        /// search for contract using contract number
        /// </summary>
        /// <param name="contractNum">contract number to search for</param>
        /// <param name="currentId">current id used to redisplay</param>
        /// <returns></returns>
        [HttpPost]
        public PartialViewResult Contract(string contractNum, int? currentId) {
            ViewBag.Action = "Contract";//used to render paging navigation in drawing listing
            try {
                var contract = _workUnit.ContractRepository.Entities.
                    First(x => x.ContractNum.ToUpper().Trim() == contractNum.ToUpper().Trim());
                var contractData = getContractDetailById(contract.ContractId, null, null);
                updateTempDataMessage("Entry found! Conntract info updated", "info");
                return PartialView(contractData);
            }
            catch//not found. Redisplay current data
            {
                if (currentId == null) {
                    updateTempDataMessage("Invalid contract #", "important");
                    ViewBag.ContractNum = contractNum;
                    return PartialView(new ContractData() { Contract = null, Drawings = null });
                }
                updateTempDataMessage("Contract with No. " + contractNum + " was not found", "important");
                var currentContractData = getContractDetailById(currentId.Value, null, null);
                return PartialView(currentContractData);
            }
        }
        #region Service methods
        public JsonResult ContractPolyById(int id) {
            var result = _workUnit.CityUltilities.getContractPolyById(id, new string[] { });
            var data = ControllerUtility.getQueryAttributes(result);

            return Json(data, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}
