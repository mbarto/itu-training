using System.Configuration;
using System.Web.Routing;
using Expoware.Youbiquitous.Extensions;
using testOpenLayer.Common;

namespace testOpenLayer
{
    public class ItuGisApplication : System.Web.HttpApplication
    {
        public static ItuSettings Settings { get; set; }

        protected void Application_Start()
        {
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            var settings = new ItuSettings
            {
                ApplicationName = ConfigurationManager.AppSettings["itu-application-name"],
                TurnOffSafetyNet = ConfigurationManager.AppSettings["itu-safetynet-on"].ToBool(),
                DevModeOn = ConfigurationManager.AppSettings["itu-dev-mode"].ToBool(),
                MaxNumberOfPoints = ConfigurationManager.AppSettings["itu-max-number-points"].ToInt()
            };
            Settings = settings;
        }
    }
}
