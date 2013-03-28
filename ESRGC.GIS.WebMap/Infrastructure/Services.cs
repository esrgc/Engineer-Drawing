using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Ninject.Modules;
using System.Configuration;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.DAL.Concrete;
using ESRGC.GIS.Domain.WorkUnits.Abstract;
using ESRGC.GIS.Domain.WorkUnits.Concrete;


namespace ESRGC.GIS.WebMap.Infrastructure
{
    public class Services: NinjectModule
    {
        public override void Load()
        {
            //Bind<IUnitOfWork>().To<CrimeMapWorkUnit>();

            //get map path from app settings
            //var mapFileName = ConfigurationManager.AppSettings["MapFile"];
            //var mapFilePath = HttpContext.Current.Server.MapPath("Maps/" + mapFileName);
            var connectionStr = ConfigurationManager.ConnectionStrings["SalisburyCity"].ConnectionString;
            //bind dependencies

            Bind<IRepository>()
               .To<SqlRepository>()
               .WithConstructorArgument("connectionString", connectionStr);

            Bind<ISalisburyCityWorkUnit>()
                .To<SalisburyCityWorkUnit>();
                        
        }
    }
}