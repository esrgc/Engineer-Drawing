using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.Contexts.SalisburyCity;
using ESRGC.GIS.Domain.Model;
using ESRGC.GIS.Domain.DAL.Concrete;

namespace ESRGC.GIS.Domain.WorkUnits.Concrete
{
    public class SalisburyCityWorkUnit : ISalisburyCityWorkUnit
    {
        SalisburyCityEFContext _EFContext;
        IEntityRepository<Drawing> _drawingRepo;
        IEntityRepository<Contract> _contracRepo;
        IEntityRepository<FilePath> _filePathRepo;
        IEntityRepository<Street> _streetRepo;
        IEntityRepository<StreetDrawing> _streetDrawingRepo;
        IEntityRepository<ContractDrawing> _contractDrawingRepo;

        IRepository _repo = null;
        ICityUtility _cityUtility = null;

        public SalisburyCityWorkUnit(IRepository repo, SalisburyCityEFContext EFContext)
        {
            _EFContext = EFContext;
            _repo = repo;
        }


        #region ISalisburyCityWorkUnit Members

        public ICityUtility CityUltilities
        {
            get { return _cityUtility ?? new CityUtility(_repo); }
        }

        public IEntityRepository<Contract> ContractRepository
        {
            get { return _contracRepo ?? (_contracRepo = new EntityRepository<Contract>(_EFContext)); }
        }

        public IEntityRepository<Drawing> DrawingRepository
        {
            get { return _drawingRepo ?? (_drawingRepo = new EntityRepository<Drawing>(_EFContext)); }
        }

        public IEntityRepository<FilePath> FilePathRepository
        {
            get { return _filePathRepo ?? (_filePathRepo = new EntityRepository<FilePath>(_EFContext)); }
        }

        public IEntityRepository<ContractDrawing> ContractDrawingRepository
        {
            get { return _contractDrawingRepo ?? (_contractDrawingRepo = new EntityRepository<ContractDrawing>(_EFContext)); }
        }

        public IEntityRepository<Street> StreetRepository
        {
            get { return _streetRepo ?? (_streetRepo = new EntityRepository<Street>(_EFContext)); }
        }

        public IEntityRepository<StreetDrawing> StreetDrawingRepository
        {
            get { return _streetDrawingRepo ?? (_streetDrawingRepo = new EntityRepository<StreetDrawing>(_EFContext)); }
        }
        public void SaveChanges()
        {
            _EFContext.SaveChanges();
        }

        #endregion

        public void Dispose()
        {
            _EFContext.Dispose();
        }
    }
}
