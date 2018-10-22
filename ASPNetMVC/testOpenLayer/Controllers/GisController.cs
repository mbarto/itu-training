using System.Collections.Generic;
using System.Configuration;
using System.Web.Mvc;
using testOpenLayer.Business;
using testOpenLayer.Models;

namespace testOpenLayer.Controllers
{
    public class GisController : Controller
    {
        public ActionResult Index()
        {
            var model = new GisViewModel { Title = "ITU GIS"};

            model.Points.Add(new GisPoint(16.5, 49));
            model.Points.Add(new GisPoint(17.5, 50));
            model.Points.Add(new GisPoint(18.5, 51));
            model.Points.Add(new GisPoint(19.5, 52));
            //model.Points.Add(new GisPoint(29.5, 52));
            //model.Points.Add(new GisPoint(22.5, 52));
            //model.Points.Add(new GisPoint(26.5, 52));

            return View(model);
        }

        public ActionResult Index1()
        {
            var model = new GisViewModel1 { Title = "ITU GIS - ClientSide", GeoServerUrl = ConfigurationManager.AppSettings["geoserver_url"] };
            return View(model);
        }

        public ActionResult Points([Bind(Prefix="id")] string country)
        {
            // Use "country" to query the DB for points and return the points
            var points = new List<GisPoint>
            {
                new GisPoint(16.5, 49),
                new GisPoint(17.5, 50),
                new GisPoint(18.5, 51),
                new GisPoint(19.5, 52),
                new GisPoint(29.5, 52),
                new GisPoint(22.5, 52),
                new GisPoint(26.5, 52)
            };

            var model = new GisPointsViewModel {Points = points};
            return Json(model, JsonRequestBehavior.AllowGet);

            //return Json(points, JsonRequestBehavior.AllowGet);
            //return new JsonResult{MaxJsonLength = 1000000000, Data = points};
        }
    }
}