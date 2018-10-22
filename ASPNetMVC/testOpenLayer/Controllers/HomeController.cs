using System.Web.Mvc;
using testOpenLayer.Models;

namespace testOpenLayer.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var model = new ItuViewModelBase {Title = "ITU HOME"};
            return View(model);
        }
    }
}