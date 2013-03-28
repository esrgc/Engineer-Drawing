using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using ESRGC.GIS.Domain.Model;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace ESRGC.GIS.Domain.Contexts.SalisburyCity
{
    public class SalisburyCityEFContext : DbContext
    {
        public SalisburyCityEFContext()
            : base("name=SalisburyCity")
        {

        }

        public IDbSet<Contract> Contracts { get; set; }
        public IDbSet<Drawing> Drawings { get; set; }
        public IDbSet<FilePath> FilePaths { get; set; }
        public IDbSet<ContractDrawing> ContractDrawings { get; set; }
        public IDbSet<Street> Streets { get; set; }
        public IDbSet<StreetDrawing> StreetDrawings { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}
