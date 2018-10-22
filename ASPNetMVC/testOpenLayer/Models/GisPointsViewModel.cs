using System.Collections.Generic;
using testOpenLayer.Business;

namespace testOpenLayer.Models
{
    public class GisPointsViewModel
    {
        public GisPointsViewModel()
        {
            Points = new List<GisPoint>();
        }

        public IList<GisPoint> Points { get; set; }
    }
}