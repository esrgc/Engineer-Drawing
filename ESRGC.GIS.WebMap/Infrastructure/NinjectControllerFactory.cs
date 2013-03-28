using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Ninject;
using System.Web.Routing;

namespace ESRGC.GIS.WebMap.Infrastructure
{
    public class NinjectControllerFactory : DefaultControllerFactory
    {
        //a Ninject "kernel is the thing that can supply object instances
        private IKernel kernel = new StandardKernel(new Services());

        //ASP.NET MVC calls this to get the controller for each request
        protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
        {
            if (controllerType == null)
                return null;
            return (IController)kernel.Get(controllerType);
        }
    }
}