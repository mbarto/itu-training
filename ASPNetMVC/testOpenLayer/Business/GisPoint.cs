

namespace testOpenLayer.Business
{
    public class GisPoint
    {
        public GisPoint(double lat, double longit)
        {
            Lat = lat;
            Long = longit;
        }

        public double Lat { get; set; }
        public double Long { get; set; }
    }
}