using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.Contexts.SalisburyCity;
using ESRGC.GIS.Domain.Model;
using ESRGC.GIS.Domain.DAL.Abstract;

namespace ESRGC.GIS.Domain.WorkUnits.Abstract
{
    public interface ISalisburyCityWorkUnit
    {
        ICityUtility CityUltilities { get; }
        /// <summary>
        /// Entity framework repository
        /// </summary>
        IEntityRepository<Contract> ContractRepository {get; }
        IEntityRepository<Drawing> DrawingRepository { get; }
        IEntityRepository<FilePath> FilePathRepository { get; }
        IEntityRepository<Street> StreetRepository { get; }
        IEntityRepository<ContractDrawing> ContractDrawingRepository { get; }
        IEntityRepository<StreetDrawing> StreetDrawingRepository { get; }

        void SaveChanges();
    }
}
